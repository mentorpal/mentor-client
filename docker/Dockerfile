/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
FROM node:14.16 as builder
RUN apt-get update && \
    apt-get install -y \
        libgif-dev \
        libglu1 \
        libjpeg-dev \
        libpng-dev \
        libtiff-dev \
        libxi-dev && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY client ./client
RUN cd client && \
    npm ci && \
    npm run build
FROM nginx:1-alpine 
EXPOSE 80
COPY docker/nginx/conf.d /etc/nginx/conf.d
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /build/client/public /etc/nginx/html/chat
# cypress will request the root even though noone else uses it
RUN echo "OK" >> /etc/nginx/html/index.html