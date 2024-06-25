import type { InitDataParsed, User } from '@telegram-apps/sdk';

/**
 * Removes undefined properties from the object.
 * @param object - object to remove properties from.
 */
function removeUndefined(object: Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in object) {
    const v = object[key];
    if (v !== undefined) {
      result[key] = v;
    }
  }
  return result;
}

/**
 * Serializes user information.
 * @param user - user information.
 */
function serializeUser(user: User | undefined): string | undefined {
  return user
    ? JSON.stringify({
      added_to_attachment_menu: user.addedToAttachmentMenu,
      allows_write_to_pm: user.allowsWriteToPm,
      first_name: user.firstName,
      id: user.id,
      is_bot: user.isBot,
      is_premium: user.isPremium,
      language_code: user.languageCode,
      last_name: user.lastName,
      photo_url: user.photoUrl,
      username: user.username,
    })
    : undefined;
}

export function initDataToSearchParams({
  chat,
  receiver,
  user,
  ...data
}: Partial<InitDataParsed>): URLSearchParams {
  return new URLSearchParams(
    removeUndefined({
      auth_date: data.authDate
        ? ((+data.authDate / 1000) | 0).toString()
        : undefined,
      can_send_after: data.canSendAfter?.toString(),
      chat: chat
        ? JSON.stringify({
          id: chat.id,
          type: chat.type,
          title: chat.title,
          photo_url: chat.type,
          username: chat.username,
        })
        : undefined,
      chat_instance: data.chatInstance,
      chat_type: data.chatType || undefined,
      hash: data.hash,
      query_id: data.queryId,
      receiver: serializeUser(receiver),
      start_param: data.startParam || undefined,
      user: serializeUser(user),
    }),
  );
}