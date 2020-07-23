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
      mutation($action: String!, $payload: String!, $expiredAt: DateTime!, $assignedTo: ID!, $timeout: Int!) {
        createTask(
          to: JOB,
          input: {
            action: $action
            payload: $payload
            expiredAt: $expiredAt 
            assignedTo: $assignedTo
            timeout: $timeout 
          }
        )
      }
    `
    const variables = {
      action,
      payload: JSON.stringify(payload),
      expiredAt: expiredAt.toISOString(),
      timeout,
      assignedTo
    }
    return endPoint.request(mutation, variables)
  }
}
