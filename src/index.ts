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
  private static logPrefix = '[idobata-webhook] ';

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

  async beforeDeploy(): Promise<void> {
    this.notifyIdobata(
      await formatMessage(
        this.customData?.beforeDeployMessage ??
          '{currentTime} [{username}@{hostname}] ({currentBranch}) deploy started!'
      )
    );
  }

  async afterDeploy(): Promise<void> {
    this.notifyIdobata(
      await formatMessage(
        this.customData?.afterDeployMessage ??
          '{currentTime} [{username}@{hostname}] ({currentBranch}) deploy finished!'
      )
    );
  }

  async notifyIdobata(message: string): Promise<void> {
    if (!this.customData?.webhookUrl) {
      this.errorLog('***** no webhook url in custom.');
      return;
    }

    try {
      const body = new FormData();
      body.append('source', message);
      await got.post(this.customData.webhookUrl, {
        body,
      });
    } catch (e) {
      this.errorLog(
        `***** error occurred at send notification to idobata: ${e}`
      );
    }
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

  errorLog(message: string): void {
    this.serverless.cli.log(
      chalk.red(`${ServerlessIdobataWebhook.logPrefix}${message}`)
    );
  }

  infoLog(message: string): void {
    this.serverless.cli.log(`${ServerlessIdobataWebhook.logPrefix}${message}`);
  }
}

export = ServerlessIdobataWebhook;
