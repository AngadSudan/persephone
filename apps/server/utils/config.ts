export const podConfig = `
apiVersion: v1
kind: Pod
metadata:
  name: _podname_
  labels:
    app: _podlabel_
spec:
  tolerations:
    - operator: Exists
  containers:
    - name: interview-room
      image: bitwiselearn/codex:js-container
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 8443
        - containerPort: 8000

`;
export const serviceConfig = `
apiVersion: v1
kind: Service
metadata:
  name: _podname_-pod-service
spec:
  selector:
    app: _podlabel_
  ports:
    - name: https
      port: 443
      targetPort: 8443
    - name: http
      port: 80
      targetPort: 8000
  type: ClusterIP
`;

export const ingressConfig = `
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: interview-room-ingress-_slug_
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-wildcard
spec:
  ingressClassName: nginx

  rules:
  - host: "_slug_.code.angadsudan.me"
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: _podname_-pod-service
            port:
              number: 443

  - host: "_slug_.output.angadsudan.me"
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: _podname_-pod-service
            port:
              number: 80
`;
