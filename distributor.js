const { CronJob } = require('cron')
const pub = require('./publisher')
const log4js = require('log4js')
const _ = require('lodash')
const fs = require('fs')

const logger = log4js.getLogger('distributer')
const stats = {}

logger.level = 'debug'

const distribute = () => {
  logger.debug('=> distribute jobs')
  const jobs = JSON.parse(fs.readFileSync('./assets/jobs.json', 'utf8'))
  jobs.forEach(job => {
    const { action, payload, timeout, expire, interval } = job
    new CronJob(interval, () => {
      const liveBots = stats.bots.filter(({ live }) => live)
      if (!liveBots.length) return logger.error(`=> All bots are off`)
      const bot = _.minBy(liveBots, ({ pendingTask }) => pendingTask)
      const expiredAt = new Date(Date.now() + expire * 1000)
      pub.createJob({ action, payload, timeout, expiredAt, assignedTo: bot.id })
        .then(({ createTask }) => logger.debug(`=> ${action} ${createTask}`))
        .catch(e => logger.error(e))
    }, null, true)
  })
}

/* Start syncing with publisher */
const everyTwoSeconds = '*/5 * * * * *'
new CronJob(everyTwoSeconds, () => {
  logger.debug(`=> Syncing`)
  pub.bots().then(({ bots }) => {
    if (!stats.bots) {
      _.extend(stats, { bots })
      return distribute(stats)
    }
    _.extend(stats, { bots })
  }).catch(e => logger.error(e))
}, null, true)




