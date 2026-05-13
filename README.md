# Lambda Notificaciones - Microservicio

Este microservicio se activa automáticamente a través de eventos de **DynamoDB Streams** (cuando ocurre una inserción en la tabla de Compras). Construye una plantilla HTML y envía el recibo de compra al usuario a través de Amazon SES de forma totalmente asíncrona.

## Pipeline CI/CD
Se utiliza GitHub Actions para automatizar el ciclo de vida del software, desplegando mediante la AWS CLI sobre la infraestructura pre-aprovisionada por Terraform.

## Secretos Requeridos:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
