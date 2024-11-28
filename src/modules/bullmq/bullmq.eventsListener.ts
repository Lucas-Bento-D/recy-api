import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from '@nestjs/bullmq';

import { REPORT_QUEUE } from './bullmq.constants';

@QueueEventsListener(REPORT_QUEUE)
export class BullMQEventsListener extends QueueEventsHost {
  @OnQueueEvent('active')
  onActive(
    args: {
      jobId: string;
      prev?: string;
    },
    id: string,
  ) {
    console.log(
      `Active event on ${REPORT_QUEUE} with id: ${id} and args: ${JSON.stringify(
        args,
      )}`,
    );
  }

  @OnQueueEvent('completed')
  onCompleted(
    args: {
      jobId: string;
      returnvalue: string;
      prev?: string;
    },
    id: string,
  ) {
    console.log(
      `Completed event on ${REPORT_QUEUE} with id: ${id} and args: ${JSON.stringify(
        args,
      )}`,
    );
  }

  @OnQueueEvent('failed')
  onFailed(
    args: {
      jobId: string;
      failedReason: string;
      prev?: string;
    },
    id: string,
  ) {
    console.log(
      `Failed event on ${REPORT_QUEUE} with id: ${id} and args: ${JSON.stringify(
        args,
      )}`,
    );
  }
}
