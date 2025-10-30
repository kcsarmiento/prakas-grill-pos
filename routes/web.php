<?php

use Illuminate\Support\Facades\Route;

// POS page
Route::get('/pos', function () {
    return view('pos', ['activePage' => 'pos']);
})->name('pos');

// Inventory page
Route::get('/inventory', function () {
    return view('pos', ['activePage' => 'inventory']);
})->name('inventory');

// Sales report page
Route::get('/report', function () {
    return view('pos', ['activePage' => 'report']);
})->name('report');

// Optional: redirect root '/' to /pos
Route::get('/', function () {
    return redirect()->route('pos');
});
