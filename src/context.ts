import { HealthController } from "health-service"
import { ErrorHandler, Processor, RetryWriter, StringMap } from "message-processing"
import { Pool } from "mysql2"
import { MySQLChecker, MySQLWriter } from "mysql2-core"
import { Logger } from "onecore"
import { RedisClientType } from "redis"
import { RedisChecker, RedisPublisher, RedisSubscriber } from "redis-messaging"
import { Validator } from "validation-core"
import { User, userModel } from "./user"

const retries = [5000, 10000, 20000]

export interface ApplicationContext {
  health: HealthController
  process: (data: User, header?: StringMap) => Promise<number>
  subscribe: (handle: (data: User) => Promise<number>) => Promise<void>
  publish: (data: User) => Promise<number>
}

export async function createContext(pool: Pool, client: RedisClientType, channel: string, logger: Logger): Promise<ApplicationContext> {
  await client.connect()

  const redisChecker = new RedisChecker(client)
  const mysqlChecker = new MySQLChecker(pool)
  const health = new HealthController([redisChecker, mysqlChecker])
  const publisher = new RedisPublisher<User>(client, channel)
  const writer = new MySQLWriter<User>(pool, "users", userModel)
  const retryWriter = new RetryWriter(writer.write, retries, writeUser, logger.error)
  const errorHandler = new ErrorHandler(logger.error)
  const validator = new Validator<User>(userModel, true)
  const processor = new Processor<User, number>(retryWriter.write, validator.validate, [], errorHandler.error, logger.error, logger.info)
  const subscriber = new RedisSubscriber<User, number>(client, channel, logger.error)
  const ctx: ApplicationContext = { health, subscribe: subscriber.subscribe, publish: publisher.publish, process: processor.process }
  return ctx
}

export function writeUser(msg: User): Promise<number> {
  console.log("Error: " + JSON.stringify(msg))
  return Promise.resolve(1)
}
