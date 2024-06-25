import { useEffect, useState } from 'react';
import { type LaunchParams, retrieveLaunchParams } from '@telegram-apps/sdk';

/**
 * @returns Launch parameters.
 */
export function useLaunchParams(ssr: true): LaunchParams | undefined;

/**
 * @returns Launch parameters.
 */
export function useLaunchParams(ssr?: false): LaunchParams;

export function useLaunchParams(ssr?: boolean): LaunchParams | undefined {
  const [lp, setLp] = useState<LaunchParams | undefined>(() => {
    return ssr ? undefined : retrieveLaunchParams();
  });

  useEffect(() => {
    if (ssr) {
      setLp(retrieveLaunchParams());
    }
  }, []);

  return lp;
}