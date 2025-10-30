<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prakas Grill POS</title>
  <link rel="stylesheet" href="{{ asset('css/pos.css') }}">
</head>
<body>
  <div class="app-wrapper">
    @yield('content')
  </div>

  <script src="{{ asset('js/script.js') }}"></script>
  <script src="{{ asset('js/pos.js') }}"></script>
</body>
</html>
