<?php
require_once "../config/conexion.php";

class Pais {

    // READ
    public static function todos() {
        $cn = Conexion::conectar();
        $sql = "SELECT Codigo, Pais FROM Paises ORDER BY Pais";
        $stmt = $cn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // CREATE
    public static function insertar($codigo, $pais) {
        $cn = Conexion::conectar();
        $sql = "INSERT INTO Paises (Codigo, Pais) VALUES (?, ?)";
        $stmt = $cn->prepare($sql);
        return $stmt->execute([$codigo, $pais]);
    }

    // DELETE
    public static function eliminar($codigo) {
        $cn = Conexion::conectar();
        $sql = "DELETE FROM Paises WHERE Codigo = ?";
        $stmt = $cn->prepare($sql);
        return $stmt->execute([$codigo]);
    }

    // READ ONE (para editar después)
    public static function uno($codigo) {
        $cn = Conexion::conectar();
        $sql = "SELECT Codigo, Pais FROM Paises WHERE Codigo = ?";
        $stmt = $cn->prepare($sql);
        $stmt->execute([$codigo]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // UPDATE
    public static function actualizar($codigo, $pais) {
        $cn = Conexion::conectar();
        $sql = "UPDATE Paises SET Pais = ? WHERE Codigo = ?";
        $stmt = $cn->prepare($sql);
        return $stmt->execute([$pais, $codigo]);
    }
}
