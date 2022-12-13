import { OnTransactionHandler } from '@metamask/snap-types'
import type { ProcessedSimulation } from './processed_simulation'

const SERVER_URL = 'https://us.pocketsimulator.app/api'

/**
 * Handle transaction insights.
 */
export const onTransaction: OnTransactionHandler = async (args: {
  transaction: { [key: string]: unknown }
  chainId: string
}) => {
  let error_msg = 'Unexpected error simulating'

  try {
    const result: any = await fetch(`${SERVER_URL}/v2/simulate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(args.transaction),
    })

    if (result.status === 200) {
      const data: ProcessedSimulation = await result.json()

      if ('revert' in data.simulation) {
        let optionalRevertMsg = data.simulation.revert.message
          ? ` with message "${data.simulation.revert.message}"`
          : ''
        return {
          insights: {
            'Pocket Universe': 'Transaction will revert' + optionalRevertMsg,
          },
        }
      } else {
        if (data.alerts.length == 0) {
          return {
            insights: {
              'Pocket Universe': 'No alerts found',
            },
          }
        } else {
          let insights = {
            'Pocket Universe Detected Alerts': data.alerts.map(
              (alert) => alert.msg,
            ),
          }
          return {
            insights,
          }
        }
      }
    }
  } catch (e) {
    // Fall through with unexpected error msg
  }

  return {
    insights: {
      'Error Occurred Simulating': error_msg,
    },
  }
}
