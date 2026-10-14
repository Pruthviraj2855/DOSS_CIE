FROM nginx:alpine

LABEL maintainer="Student Task Manager"
LABEL description="Student Task Manager web application"

COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY script.js /usr/share/nginx/html/script.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]