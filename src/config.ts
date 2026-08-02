export const config = {
  port: 8088,
  secure: false,
  log: {
    level: "debug",
    map: {
      time: "@timestamp",
      msg: "message",
    },
  },
  middleware: {
    log: true,
    skips: "health,log",
    request: "request",
    status: "status",
    size: "size",
  },
  db: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "abcd1234",
    database: "masterdata",
    multipleStatements: true,
  },
  retries: {
    1: 10000,
    2: 15000,
    3: 25000,
  },
  redis: {
    url: "redis://localhost:6379",
  },
  channel: "users",
}

export const environments = {
  sit: {
    mongo: {
      db: "masterdata",
    },
  },
  prd: {
    log: {
      level: "error",
    },
    middleware: {
      log: false,
    },
  },
}
