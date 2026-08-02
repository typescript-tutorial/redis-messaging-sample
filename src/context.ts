import { HealthController } from "health-service"
import { ErrorHandler, Processor, StringMap } from "message-processing"
import { Pool } from "mysql2"
import { MySQLChecker, MySQLWriter } from "mysql2-core"
import { Logger } from "onecore"
import { RedisClientType } from "redis"
import { RedisChecker, RedisPublisher, RedisSubscriber } from "redis-messaging"
import { Validator } from "validation-core"
import { User, userModel } from "./user"

export interface ApplicationContext {
  health: HealthController
  process: (data: User, header?: StringMap) => Promise<number>
  subscribe: (handle: (data: User) => Promise<number>) => Promise<void>
  publish: (data: User) => Promise<number>
}

export async function createContext(pool: Pool, client: RedisClientType, channel: string, logger: Logger, retries: number[]): Promise<ApplicationContext> {
  await client.connect()

  const publisher = new RedisPublisher<User>(client, channel)

  const redisChecker = new RedisChecker(client)
  const mysqlChecker = new MySQLChecker(pool.promise())
  const health = new HealthController([redisChecker, mysqlChecker])

  const writer = new MySQLWriter<User>(pool, "users", userModel)
  const validator = new Validator<User>(userModel, true)
  const errorHandler = new ErrorHandler(logger.error)
  const processor = new Processor<User, number>(writer.write, validator.validate, retries, errorHandler.error, logger.error, logger.info)
  const subscriber = new RedisSubscriber<User, number>(client, channel, logger.error)

  const ctx: ApplicationContext = { health, subscribe: subscriber.subscribe, publish: publisher.publish, process: processor.process }
  return ctx
}

export function writeUser(msg: User): Promise<number> {
  console.log("Error: " + JSON.stringify(msg))
  return Promise.resolve(1)
}
