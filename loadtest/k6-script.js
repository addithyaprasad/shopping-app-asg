/*import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 20 },
    { duration: "2m", target: 60 },
    { duration: "2m", target: 120 },
    { duration: "1m", target: 0 }
  ]
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8081";

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    "status is 200": (r) => r.status === 200
  });
  sleep(1);
}*/
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp up
    { duration: '5m', target: 500 },   // steady load
    { duration: '2m', target: 0 },    // ramp down
  ],
};

export default function () {
  const res = http.get('http://shop-alb-1467212189.us-east-1.elb.amazonaws.com/');

  http.get('http://shop-alb-1467212189.us-east-1.elb.amazonaws.com/');              // homepage

  http.get('http://shop-alb-1467212189.us-east-1.elb.amazonaws.com/api/products');  // backend call
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

}
