/**
 * Known type of chat.
 */
export type ChatType =
  | 'sender'
  | 'private'
  | 'group'
  | 'supergroup'
  | 'channel'
  | string;

export interface User {
  /**
   * True, if this user added the bot to the attachment menu.
   */
  added_to_attachment_menu?: boolean;
  /**
   * True, if this user allowed the bot to message them.
   */
  allows_write_to_pm?: boolean;
  /**
   * First name of the user or bot.
   */
  first_name: string;
  /**
   * A unique identifier for the user or bot.
   */
  id: number;
  /**
   * True, if this user is a bot. Returned in the `receiver` field only.
   * @see receiver
   */
  is_bot?: boolean;
  /**
   * True, if this user is a Telegram Premium user.
   */
  is_premium?: boolean;
  /**
   * Last name of the user or bot.
   */
  last_name?: string;
  /**
   * [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) of the user's language.
   * Returns in user field only.
   */
  language_code?: string;
  /**
   * URL of the user’s profile photo. The photo can be in .jpeg or .svg
   * formats. Only returned for Mini Apps launched from the attachment menu.
   */
  photo_url?: string;
  /**
   * Username of the user or bot.
   */
  username?: string;
}

/**
 * Describes Telegram Mini Apps [Chat](https://docs.telegram-mini-apps.com/platform/init-data#chat) type.
 */
export interface Chat {
  /**
   * Unique identifier for this chat.
   */
  id: number;
  /**
   * URL of the chat’s photo. The photo can be in .jpeg or .svg formats.
   * Only returned for Mini Apps launched from the attachment menu.
   */
  photo_url?: string;
  /**
   * Type of the chat.
   */
  type: 'group' | 'supergroup' | 'channel' | string;
  /**
   * Title of the chat.
   */
  title: string;
  /**
   * Username of the chat.
   */
  username?: string;
}

/**
 * Describes Telegram Mini Apps [InitData](https://docs.telegram-mini-apps.com/platform/init-data#parameters-list)
 * type.
 */
export interface InitData {
  /**
   * Init data generation date.
   */
  auth_date: Date;
  /**
   * The number of seconds after which a message can be sent via the method [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery).
   */
  can_send_after?: number;
  /**
   * An object containing data about the chat where the bot was launched via
   * the attachment menu. Returned for supergroups, channels and group
   * chats – only for Mini Apps launched via the attachment menu.
   */
  chat?: Chat;
  /**
   * The type of chat from which Mini App was opened.
   */
  chat_type?: ChatType;
  /**
   * A global identifier indicating the chat from which Mini App was opened. Returned only for
   * applications opened by direct link.
   */
  chat_instance?: string;
  /**
   * A hash of all passed parameters, which the bot server can use to
   * check their [validity](https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app).
   */
  hash: string;
  /**
   * A unique identifier for the Mini App session, required for sending
   * messages via the [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery) method.
   */
  query_id?: string;
  /**
   * An object containing data about the chat partner of the current user in
   * the chat where the bot was launched via the attachment menu.
   * Returned only for private chats and only for Mini Apps launched
   * via the attachment menu.
   */
  receiver?: User;
  /**
   * The value of the `startattach` or `startapp` parameter, passed via link.
   */
  start_param?: string;
  /**
   * Init data signature used during 3-rd party validation.
   */
  signature: string;
  /**
   * An object containing data about the current user.
   */
  user?: User;
}
