import { MessageRequester } from "../types";
import { Message } from "../message";

export class InExtensionMessageRequester implements MessageRequester {
  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] = window.location.origin;

    return await browser.runtime.sendMessage({
      port,
      type: msg.type(),
      msg,
    });
  }

  async sendMessageToTab<M extends Message<unknown>>(
    _tabId: number,
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validateBasic();

    // Set message's origin.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    msg["origin"] = window.location.origin;

    return await browser.runtime.sendMessage({
      port,
      type: msg.type(),
      msg,
    });
  }
}
