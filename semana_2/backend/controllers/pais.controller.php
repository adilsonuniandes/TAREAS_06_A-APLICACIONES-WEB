<?php
require_once "../config/cors.php";
require_once "../models/paises.models.php";

$op = $_GET["op"] ?? "";

switch ($op) {

    case "todos":
        echo json_encode(Pais::todos());
        break;

    case "insertar":
        echo json_encode(
            Pais::insertar($_POST["Codigo"], $_POST["Pais"]) ? "ok" : "error"
        );
        break;

    case "eliminar":
        echo json_encode(
            Pais::eliminar($_POST["Codigo"]) ? "ok" : "error"
        );
        break;

    case "uno":
        echo json_encode(
            Pais::uno($_POST["Codigo"])
        );
        break;

    case "actualizar":
        echo json_encode(
            Pais::actualizar($_POST["Codigo"], $_POST["Pais"]) ? "ok" : "error"
        );
        break;

    default:
        echo json_encode(["error" => "Operación no válida"]);
        break;
}
