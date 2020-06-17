import * as DateFns from 'date-fns';
import ip from 'ip';
import os from 'os';
import pupa from 'pupa';

export function formatMessage(templateText: string): string {
  const hostname = os.hostname();
  const currentTime = DateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const username = os.userInfo().username;
  const ipAddress = ip.address();

  return pupa(templateText, {
    hostname,
    currentTime,
    username,
    ipAddress,
  });
}
