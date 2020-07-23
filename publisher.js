const { GraphQLClient } = require('graphql-request')

const endPoint = new GraphQLClient(process.env.PUBLISHER_URL)

module.exports = {
  bots() {
    const query = `
      query {
        bots {
          id
          updatedAt
          pendingTask
          pendingProcess
          live
        }
      }
    `
    return endPoint.request(query)
  },
  createJob({ action, payload, expiredAt, timeout, assignedTo }) {
    const mutation = `
      mutation {
        createTask(
          to: CONTROL,
          input: {
            action: "${action}"
            payload: "${payload}",
            expiredAt: "${expiredAt.toISOString()}"
            assignedTo: "${assignedTo}"
            timeout: ${timeout} 
          }
        )
      }
    `
    return endPoint.request(mutation)
  }
}
