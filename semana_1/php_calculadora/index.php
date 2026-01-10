<?php
session_start();

/*
  Estado de la calculadora
*/
if (!isset($_SESSION["expresion"])) {
    $_SESSION["expresion"] = "";
}

if (!isset($_SESSION["pantalla"])) {
    $_SESSION["pantalla"] = "0";
}

/*
  Evaluación segura de expresión matemática
*/
function evaluar_expresion_segura(string $expresion) {
    // Solo permitir números, operadores, paréntesis, puntos y espacios
    if (!preg_match('~^[0-9+\-*\/().\s]+$~', $expresion)) {
        return null;
    }

    try {
        // phpcs:ignore
        $resultado = @eval("return ($expresion);");

        if ($resultado === false || $resultado === null) {
            return null;
        }

        if (is_infinite($resultado) || is_nan($resultado)) {
            return null;
        }

        return $resultado;
    } catch (Throwable $e) {
        return null;
    }
}

$boton = $_POST["btn"] ?? null;

if ($boton !== null) {

    // Limpiar todo
    if ($boton === "AC") {
        $_SESSION["expresion"] = "";
        $_SESSION["pantalla"] = "0";
    }

    // Cambiar signo del último número
    elseif ($boton === "+/-") {
        $expresion = $_SESSION["expresion"];

        if ($expresion === "") {
            $_SESSION["expresion"] = "-";
            $_SESSION["pantalla"] = "-";
        } elseif (preg_match('/(.*?)(-?\d+(\.\d+)?)$/', $expresion, $c)) {
            $prefijo = $c[1];
            $numero  = $c[2];

            $numero = str_starts_with($numero, "-")
                    ? substr($numero, 1)
                    : "-" . $numero;

            $_SESSION["expresion"] = $prefijo . $numero;
            $_SESSION["pantalla"]  = $numero;
        }
    }

    // Porcentaje (último número / 100)
    elseif ($boton === "%") {
        $expresion = $_SESSION["expresion"];

        if (preg_match('/(.*?)(-?\d+(\.\d+)?)$/', $expresion, $c)) {
            $prefijo = $c[1];
            $numero  = (float)$c[2] / 100;

            $_SESSION["expresion"] = $prefijo . $numero;
            $_SESSION["pantalla"]  = (string)$numero;
        }
    }

    // Calcular resultado
    elseif ($boton === "=") {
        $expresion = $_SESSION["expresion"];

        // No permitir terminar en operador
        if (preg_match('/[+\-*\/]$/', $expresion)) {
            $_SESSION["pantalla"] = "Error";
        } else {
            $resultado = evaluar_expresion_segura($expresion);

            if ($resultado === null) {
                $_SESSION["pantalla"] = "Error";
            } else {
                // Si es entero, mostrar como entero
                if (abs($resultado - round($resultado)) < 1e-10) {
                    $resultado = (int)round($resultado);
                }

                $_SESSION["expresion"] = (string)$resultado;
                $_SESSION["pantalla"]  = (string)$resultado;
            }
        }
    }

    // Entrada normal (números y operadores)
    else {
        $mapa_simbolos = [
                "×" => "*",
                "÷" => "/",
                "," => "."
        ];

        $valor = $mapa_simbolos[$boton] ?? $boton;

        // Si estaba en error y escribe algo, reiniciar
        if ($_SESSION["pantalla"] === "Error") {
            $_SESSION["expresion"] = "";
            $_SESSION["pantalla"]  = "0";
        }

        $expresion = $_SESSION["expresion"];

        // Operadores
        if (in_array($valor, ["+", "-", "*", "/"])) {

            // No permitir iniciar con +,*,/ (solo con -)
            if ($expresion === "" && $valor !== "-") {
                // no hacer nada
            }
            // Si ya termina en operador, reemplazar
            elseif (preg_match('/[+\-*\/]$/', $expresion)) {
                $expresion = preg_replace('/[+\-*\/]$/', $valor, $expresion);
            }
            // Si no, agregar operador
            else {
                $expresion .= $valor;
            }

        } else {
            // Números o punto
            $expresion .= $valor;
        }

        $_SESSION["expresion"] = $expresion;

        // Mostrar último número en pantalla
        if (preg_match('/(-?\d+(\.\d+)?)$/', $expresion, $c)) {
            $_SESSION["pantalla"] = $c[1];
        }
    }
}

$pantalla = $_SESSION["pantalla"];
$pantalla_visual = str_replace(".", ",", $pantalla);

// Limitar longitud visual (como calculadora real)
if (strlen($pantalla_visual) > 10) {
    $pantalla_visual = substr($pantalla_visual, 0, 10);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>La Calculadora de Adilson</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<div class="calc">
    <div class="display"><?php echo htmlspecialchars($pantalla_visual); ?></div>
    <div class="marca">La Calculadora de Adilson</div>

    <form method="post">
        <div class="grid">
            <button class="btn func" type="submit" name="btn" value="AC">AC</button>
            <button class="btn func" type="submit" name="btn" value="+/-">+/-</button>
            <button class="btn func" type="submit" name="btn" value="%">%</button>
            <button class="btn op"   type="submit" name="btn" value="÷">÷</button>

            <button class="btn num" type="submit" name="btn" value="7">7</button>
            <button class="btn num" type="submit" name="btn" value="8">8</button>
            <button class="btn num" type="submit" name="btn" value="9">9</button>
            <button class="btn op"  type="submit" name="btn" value="×">×</button>

            <button class="btn num" type="submit" name="btn" value="4">4</button>
            <button class="btn num" type="submit" name="btn" value="5">5</button>
            <button class="btn num" type="submit" name="btn" value="6">6</button>
            <button class="btn op"  type="submit" name="btn" value="-">-</button>

            <button class="btn num" type="submit" name="btn" value="1">1</button>
            <button class="btn num" type="submit" name="btn" value="2">2</button>
            <button class="btn num" type="submit" name="btn" value="3">3</button>
            <button class="btn op"  type="submit" name="btn" value="+">+</button>

            <button class="btn num zero" type="submit" name="btn" value="0">0</button>
            <button class="btn num" type="submit" name="btn" value=",">,</button>
            <button class="btn op"  type="submit" name="btn" value="=">=</button>
        </div>
    </form>
</div>

</body>
</html>
