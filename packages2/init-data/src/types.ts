/**
 * Type of the chat from which the mini app was opened.
 */
export type ChatType =
  | 'sender'
  | 'private'
  | 'group'
  | 'supergroup'
  | 'channel'
  | string;

/**
 * @see https://core.telegram.org/bots/webapps#webappuser
 */
export interface User {
  /**
   * True if the user added the bot to the attachment menu.
   */
  added_to_attachment_menu?: boolean;
  /**
   * True if the user allowed the bot to message them.
   */
  allows_write_to_pm?: boolean;
  /**
   * First name of the user or bot.
   */
  first_name: string;
  /**
   * Unique identifier of the user or bot.
   */
  id: number;
  /**
   * True if the user is a bot. Returned in the `receiver` field only.
   */
  is_bot?: boolean;
  /**
   * True if the user has Telegram Premium.
   */
  is_premium?: boolean;
  /**
   * [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) of the user's
   * language. Returned in the `user` field only.
   */
  language_code?: string;
  /**
   * Last name of the user or bot.
   */
  last_name?: string;
  /**
   * URL of the user's profile photo in the .jpeg or .svg format.
   */
  photo_url?: string;
  /**
   * Username of the user or bot.
   */
  username?: string;
}

/**
 * @see https://core.telegram.org/bots/webapps#webappchat
 */
export interface Chat {
  /**
   * Unique identifier of the chat.
   */
  id: number;
  /**
   * URL of the chat's photo in the .jpeg or .svg format. Returned only for mini apps launched
   * from the attachment menu.
   */
  photo_url?: string;
  /**
   * Title of the chat.
   */
  title: string;
  /**
   * Type of the chat.
   */
  type: 'group' | 'supergroup' | 'channel' | string;
  /**
   * Username of the chat.
   */
  username?: string;
}

/**
 * Init data passed by the Telegram client to the mini app.
 * @see https://core.telegram.org/bots/webapps#webappinitdata
 * @see https://docs.telegram-mini-apps.com/platform/init-data
 */
export interface InitData {
  /**
   * Date when the init data was created.
   */
  auth_date: Date;
  /**
   * Number of seconds after which a message can be sent via the
   * [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery) method.
   */
  can_send_after?: number;
  /**
   * Chat where the bot was launched via the attachment menu, or the chat of the processed join
   * request. Returned for supergroups, channels and group chats.
   */
  chat?: Chat;
  /**
   * Global identifier of the chat from which the mini app was opened. Returned only for mini
   * apps opened by a direct link.
   */
  chat_instance?: string;
  /**
   * Unique identifier for processing a chat join request via the
   * [answerChatJoinRequestQuery](https://core.telegram.org/bots/api#answerchatjoinrequestquery)
   * method.
   */
  chat_join_request_query_id?: string;
  /**
   * Type of the chat from which the mini app was opened. Returned only for mini apps opened by
   * a direct link.
   */
  chat_type?: ChatType;
  /**
   * Init data hash used to validate it with the bot token.
   * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   */
  hash: string;
  /**
   * Unique identifier of the mini app session, required for sending messages via the
   * [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery) method.
   */
  query_id?: string;
  /**
   * Chat partner of the current user in the chat where the bot was launched via the attachment
   * menu. Returned only for private chats.
   */
  receiver?: User;
  /**
   * Init data signature used to validate it without the bot token.
   * @see https://core.telegram.org/bots/webapps#validating-data-for-third-party-use
   */
  signature?: string;
  /**
   * Value of the `startattach` or `startapp` parameter passed in the link.
   */
  start_param?: string;
  /**
   * Current user.
   */
  user?: User;
}
