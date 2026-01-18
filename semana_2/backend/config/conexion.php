<?php
class Conexion {
  public static function conectar() {
    try {
      $cn = new PDO(
        "sqlsrv:Server=sqlserver,1433;Database=crud_semana_2;Encrypt=yes;TrustServerCertificate=yes",
        "sa",
        "P@ssw0rd123!",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
      );
      return $cn;
    } catch (PDOException $e) {
        http_response_code(500);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "ok" => false,
            "error" => "DB_CONNECTION_FAILED",
            "message" => $e->getMessage()
        ]);
        exit;
    }
  }
}
