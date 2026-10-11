import {
  type LaunchParams,
  retrieveLaunchParams,
  retrieveRawInitData,
  retrieveRawLaunchParams,
} from '@tma.js/sdk';
import { useMemo } from 'react';

/**
 * @returns Launch parameters from any known source.
 * @throws {LaunchParamsRetrieveError} Launch parameters are missing or invalid.
 */
export function useLaunchParams(): LaunchParams {
  return useMemo(retrieveLaunchParams, []);
}

/**
 * @returns Launch parameters in the raw format from any known source.
 * @throws {LaunchParamsRetrieveError} Launch parameters are missing.
 */
export function useRawLaunchParams(): string {
  return useMemo(retrieveRawLaunchParams, []);
}

/**
 * @returns Init data in the raw format from any known source.
 * @throws {LaunchParamsRetrieveError} Launch parameters are missing or invalid.
 */
export function useRawInitData(): string | undefined {
  return useMemo(retrieveRawInitData, []);
}
