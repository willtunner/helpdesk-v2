json-server --watch db.json

ng serve --o --host 0.0.0.0 --disable-host-check
<!-- http://<IP_DO_SERVIDOR>:4200 -->
json-server --watch db.json --host 0.0.0.0 --port 3000
<!-- const API_URL = 'http://192.168.1.102:3000'; // Substitua pelo IP do Dispositivo B -->


node backend/index.js
ng s --o --proxy-config proxy.conf.json

