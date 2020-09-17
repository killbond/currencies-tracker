FROM node:lts-slim

ARG USER_HOME_DIR="/tmp"
ARG APP_DIR="/app"
ARG USER_ID=1000

RUN apt-get update && apt-get install -qqy --no-install-recommends \
    dumb-init \
     && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENTRYPOINT ["npm", "start"]

#reduce logging, disable angular-cli analytics for ci environment
ENV NPM_CONFIG_LOGLEVEL=warn NG_CLI_ANALYTICS=false

#angular-cli rc0 crashes with .angular-cli.json in user home
ENV HOME "$USER_HOME_DIR"

WORKDIR $APP_DIR
EXPOSE 4200

# npm 5 uses different userid when installing packages, as workaround su to node when installing
# see https://github.com/npm/npm/issues/16766
RUN set -xe \
    && mkdir -p $USER_HOME_DIR \
    && chown $USER_ID $USER_HOME_DIR \
    && chmod a+rw $USER_HOME_DIR \
    && mkdir -p $APP_DIR \
    && chown $USER_ID $APP_DIR \
    && chown -R node /usr/local/lib /usr/local/include /usr/local/share /usr/local/bin \
    && (cd "$USER_HOME_DIR"; su node -c "npm install -g @angular/cli; npm cache clean --force")

USER $USER_ID