<!DOCTYPE html>
<html>
<head>
    <title>se</title>
    <script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/static/css/semantic.min.css">
    <script src="/static/js/semantic.min.js"></script>
    <script>
        $( document ).ready(function() {
            console.log("ready");
            $("button.ui.button").click(function() {
                console.log("Search pushed.");
                $.get( "/s", {
                    id: 1234
                }, function( resp ) {
                    console.log( resp ); // server response
                });

            });
        });
    </script>
</head>
<body>
<div class="ui huge action input">
    <input type="text" placeholder="Search...">
    <button class="ui button">Search</button>
</div>
<table class="ui celled table">
    <thead>
    <tr><th>Header</th>
        <th>Header</th>
        <th>Header</th>
    </tr></thead>
    <tbody>
    <tr>
        <td>Cell</td>
        <td>Cell</td>
        <td>Cell</td>
    </tr>
    <tr>
        <td>Cell</td>
        <td>Cell</td>
        <td>Cell</td>
    </tr>
    <tr>
        <td>Cell</td>
        <td>Cell</td>
        <td>Cell</td>
    </tr>
    </tbody>
    <tfoot>
    <tr><th colspan="3">
        <div class="ui right floated pagination menu">
            <a class="icon item">
                <i class="left chevron icon"></i>
            </a>
            <a class="item">1</a>
            <a class="item">2</a>
            <a class="item">3</a>
            <a class="item">4</a>
            <a class="icon item">
                <i class="right chevron icon"></i>
            </a>
        </div>
    </th>
    </tr></tfoot>
</table>
</body>
</html>