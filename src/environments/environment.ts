/**
 * Build-time environment values injected through Angular's `define` configuration.
 *
 * Development defaults are defined in angular.json under:
 * projects.darts-matcher-web.architect.build.configurations.development.define
 *
 * Build example:
 * ng build --configuration production \
 *   --define "DARTS_MATCHER_API_URL='https://api.example.com'" \
 *   --define "DARTS_MATCHER_WEB_SOCKET_URL='wss://api.example.com/darts-matcher-websocket'"
 */
declare const DARTS_MATCHER_API_URL: string;
declare const DARTS_MATCHER_WEB_SOCKET_URL: string;

export const environment = {
  dartsMatcherApiUrl: DARTS_MATCHER_API_URL,
  dartsMatcherWebSocketUrl: DARTS_MATCHER_WEB_SOCKET_URL,
};
