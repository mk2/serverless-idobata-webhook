/**
 * Serverless Plugin for Idobata Webhook Notification
 */

import chalk from 'chalk';
import FormData from 'form-data';
import got from 'got';
import Serverless from 'serverless';

import { formatMessage } from './message';

type ServerlessIdobataWebhookCustom = {
  webhookUrl: string;
  beforeDeployMessage?: string;
  afterDeployMessage?: string;
};

function isServerlessIdobataWebhookCustom(
  data: unknown
): data is ServerlessIdobataWebhookCustom {
  return (
    data != null &&
    typeof data === 'object' &&
    typeof (data as ServerlessIdobataWebhookCustom).webhookUrl === 'string'
  );
}

class ServerlessIdobataWebhook {
  public hooks = {
    'before:deploy:deploy': this.beforeDeploy.bind(this),
    'after:deploy:deploy': this.afterDeploy.bind(this),
  } as const;

  public commands = {
    idobata: {
      usage: 'No available commands.',
      lifecycleEvents: [],
      options: {},
    },
  } as const;

  customData?: ServerlessIdobataWebhookCustom;

  constructor(
    private serverless: Serverless,
    private options: Serverless.Options
  ) {
    this.customData = this.extractCustom();
  }

  beforeDeploy(): void {
    this.notifyIdobata(
      formatMessage(
        this.customData?.beforeDeployMessage ??
          '{currentTime} [{username}@{hostname}] deploy started!'
      )
    );
  }

  afterDeploy(): void {
    this.notifyIdobata(
      formatMessage(
        this.customData?.afterDeployMessage ??
          '{currentTime} [{username}@{hostname}] deploy finished!'
      )
    );
  }

  async notifyIdobata(message: string): Promise<void> {
    if (!this.customData?.webhookUrl) {
      this.serverless.cli.log(chalk.red('***** no webhook url in custom.'));
      return;
    }

    const body = new FormData();
    body.append('source', message);
    await got.post(this.customData.webhookUrl, {
      body,
    });
  }

  extractCustom(): ServerlessIdobataWebhookCustom | undefined {
    const customData = this.serverless.service.custom[
      'serverless-idobata-webhook'
    ];
    if (isServerlessIdobataWebhookCustom(customData)) {
      return customData;
    } else {
      return;
    }
  }
}

export = ServerlessIdobataWebhook;
