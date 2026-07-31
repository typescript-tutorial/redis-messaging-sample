import { merge } from "config-plus"
import dotenv from "dotenv"
import http from "http"
import { createLogger, getBody } from "logger-core"
import { toString } from "message-processing"
import { createPool } from "mysql2-core"
import { createClient } from "redis"
import { config, environments } from "./config"
import { createContext } from "./context"

dotenv.config()
const cfg = merge(config, process.env, environments, process.env.ENV)

const logger = createLogger(cfg.log)
const pool = createPool(cfg.db)
const client = createClient(cfg.redis)

client.on("ready", () => {
  logger.info("Connected successfully to Redis server")
})
client.on("error", (err) => {
  logger.error("Redis Error:" + toString(err))
})

createContext(pool, client, cfg.channel, logger).then((ctx) => {
  ctx.subscribe(ctx.process)
  http
    .createServer((req, res) => {
      if (req.url === "/health") {
        ctx.health.check(req, res)
      } else if (req.url === "/send") {
        getBody(req)
          .then((body: any) => {
            ctx
              .publish(JSON.parse(body))
              .then(() => {
                res.writeHead(200, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ message: "message was produced" }))
              })
              .catch((err: any) => {
                res.writeHead(500, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: err }))
              })
          })
          .catch((err) => console.log(err))
      }
    })
    .listen(cfg.port, () => {
      console.log("Start server at port " + cfg.port)
    })
})
