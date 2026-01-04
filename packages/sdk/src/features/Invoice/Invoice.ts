import type { InvoiceStatus, RequestError } from '@tma.js/bridge';
import { computed, type Computed, signal } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import { taskEither as TE, function as fn } from 'fp-ts';

import { ConcurrentCallError, InvalidArgumentsError } from '@/errors.js';
import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithRequest } from '@/fn-options/withRequest.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import { createIsSupportedSignal } from '@/helpers/createIsSupportedSignal.js';
import type { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { createWithChecksFp, type WithChecks, type WithChecksFp } from '@/with-checks/withChecksFp.js';

type InvoiceTask<E, T> = TE.TaskEither<RequestError | ConcurrentCallError | E, T>;

export interface InvoiceOptions extends WithVersion, WithRequest, SharedFeatureOptions {
}

/**
 * @since Mini Apps v6.1
 */
export class Invoice {
  constructor({ version, request, isTma }: InvoiceOptions) {
    const wrapSupportedTask = createWithChecksFp({
      version,
      isTma,
      requires: 'web_app_open_invoice',
      returns: 'task',
    });

    const isOpened = signal(false);
    const toggleClosed = () => {
      isOpened.set(false);
    };

    this.isSupported = createIsSupportedSignal('web_app_open_invoice', version);
    this.isOpened = computed(isOpened);
    this.openSlugFp = wrapSupportedTask((slug, options) => {
      return fn.pipe(
        this.isOpened()
          ? TE.left(new ConcurrentCallError('Invoice is already opened'))
          : TE.right(undefined as never),
        TE.chain(() => {
          isOpened.set(true);
          return request('web_app_open_invoice', 'invoice_closed', {
            ...options,
            params: { slug },
            capture: data => slug === data.slug,
          });
        }),
        TE.mapBoth(err => {
          toggleClosed();
          return err;
        }, data => {
          toggleClosed();
          return data.status;
        }),
      );
    });
    this.openUrlFp = wrapSupportedTask((url, options) => {
      const { hostname, pathname } = new URL(url, window.location.href);
      if (hostname !== 't.me') {
        return TE.left(new InvalidArgumentsError(`Link has unexpected hostname: ${hostname}`));
      }

      // Valid examples:
      // "/invoice/my-slug"
      // "/$my-slug"
      const match = pathname.match(/^\/(\$|invoice\/)([A-Za-z0-9\-_=]+)$/);
      if (!match) {
        return TE.left(new InvalidArgumentsError(
          'Expected to receive a link with a pathname in format "/invoice/{slug}" or "/${slug}"',
        ));
      }
      return this.openSlugFp(match[2], options);
    });

    this.openUrl = throwifyWithChecksFp(this.openUrlFp);
    this.openSlug = throwifyWithChecksFp(this.openSlugFp);
  }

  /**
   * Signal indicating if any invoice is currently opened.
   */
  readonly isOpened: Computed<boolean>;

  /**
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * Opens an invoice using its slug or URL.
   * @param slug - invoice slug.
   * @param options - additional options.
   * @since Mini Apps v6.1
   * @example
   * const status = await invoice.openSlug('kJNFS331');
   */
  readonly openSlugFp: WithChecksFp<
    (slug: string, options?: AsyncOptions) => InvoiceTask<never, InvoiceStatus>,
    true
  >;

  /**
   * @see openSlugFp
   */
  readonly openSlug: WithChecks<
    (slug: string, options?: AsyncOptions) => BetterPromise<InvoiceStatus>,
    true
  >;

  /**
   * Opens an invoice using its URL.
   * @param url - invoice URL.
   * @param options - additional options.
   * @since Mini Apps v6.1
   * @example
   * const status = await invoice.openUrl('https://t.me/$kJNFS331');
   */
  readonly openUrlFp: WithChecksFp<
    (url: string, options?: AsyncOptions) => (
      InvoiceTask<InvalidArgumentsError, InvoiceStatus>
    ),
    true
  >;

  /**
   * @see openUrlFp
   */
  readonly openUrl: WithChecks<
    (url: string, options?: AsyncOptions) => BetterPromise<InvoiceStatus>,
    true
  >;
}
