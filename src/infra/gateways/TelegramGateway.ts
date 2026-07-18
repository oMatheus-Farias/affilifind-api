import { Injectable } from '@kermel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import axios from 'axios';

@Injectable()
export class TelegramGateway {
  constructor(private readonly appConfig: AppConfig) {}

  async sendChannelMessage(input: TelegramGateway.Input): Promise<TelegramGateway.Output> {
    const url = `${this.appConfig.telegram.apiUrl}/bot${this.appConfig.telegram.botToken}/sendMessage`;

    const { data } = await axios.post<TelegramGateway.TelegramSendMessageResponse>(url, {
      chat_id: this.appConfig.telegram.channelChatId,
      text: input.text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

    return {
      ok: Boolean(data?.ok),
      messageId: data?.result?.message_id ?? null,
    };
  }

  async sendChannelPhoto(input: TelegramGateway.PhotoInput): Promise<TelegramGateway.Output> {
    const url = `${this.appConfig.telegram.apiUrl}/bot${this.appConfig.telegram.botToken}/sendPhoto`;

    const { data } = await axios.post<TelegramGateway.TelegramSendPhotoResponse>(url, {
      chat_id: this.appConfig.telegram.channelChatId,
      photo: input.photo,
      caption: input.caption,
      parse_mode: 'HTML',
      reply_markup: input.replyMarkup,
      show_caption_above_media: false,
    });

    return {
      ok: Boolean(data?.ok),
      messageId: data?.result?.message_id ?? null,
    };
  }
}

export namespace TelegramGateway {
  export type Input = {
    text: string;
  };

  export type PhotoInput = {
    photo: string;
    caption: string;
    replyMarkup: {
      inline_keyboard: Array<
        Array<{
          text: string;
          url: string;
        }>
      >;
    };
  };

  export type Output = {
    ok: boolean;
    messageId: number | null;
  };

  export type TelegramSendMessageResponse = {
    ok: boolean;
    result?: {
      message_id: number;
    };
  };

  export type TelegramSendPhotoResponse = TelegramSendMessageResponse;
}
