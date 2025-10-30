@extends('layouts.app')

@section('content')
<!-- Topbar -->
<header class="topbar">
  <div class="brand" onclick="window.location='{{ route('pos') }}'">
    <div class="logo">PG</div>
    <div class="brand-text">
      <div class="title">Prakas Grill</div>
      <div class="subtitle">Point of Sales</div>
    </div>
  </div>
  <div class="nav">
    <a href="{{ route('pos') }}" class="nav-btn {{ ($activePage == 'pos') ? 'active' : '' }}">POS</a>
    <a href="{{ route('inventory') }}" class="nav-btn {{ ($activePage == 'inventory') ? 'active' : '' }}">Inventory</a>
    <a href="{{ route('report') }}" class="nav-btn {{ ($activePage == 'report') ? 'active' : '' }}">Sales Report</a>
  </div>
</header>

<!-- Main Content -->
<main class="container">

  <!-- POS / Menu -->
  <div class="content page {{ ($activePage == 'pos') ? 'active' : '' }}" id="pos">
    <div class="menu-controls">
      <input type="search" id="menu-search" placeholder="Search menu...">
    </div>
    <div class="menu-grid" id="menu-grid">
      <!-- Menu items injected by JS -->
    </div>
  </div>

  <!-- Sidebar / Cart -->
  <aside class="sidebar" id="sidebar">
    <div class="cart-header">
      <div class="cart-title">Cart (<span id="cart-count">0 items</span>)</div>
    </div>
    <div class="cart-list" id="cart-items">
      <!-- Cart items injected by JS -->
    </div>
    <div class="cart-summary">
      <div>Total:</div>
      <div class="cart-total" id="cart-total">₱0</div>
    </div>
    <div class="cart-actions">
      <button id="clear-cart" class="btn ghost">Clear Cart</button>
      <button id="checkout" class="btn primary">Checkout</button>
    </div>
  </aside>

  <!-- Inventory Page -->
  <div class="content page {{ ($activePage == 'inventory') ? 'active' : '' }}" id="inventory">
    <div class="page-header">
      <h2>Inventory</h2>
      <p class="page-header-desc">Manage stock levels for menu items.</p>
    </div>
    <div class="table-wrap">
      <table class="table" id="inventory-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Inventory injected by JS -->
        </tbody>
      </table>
    </div>
    <div style="margin-top:12px; display:flex; gap:10px;">
      <button id="save-inventory" class="btn primary">Save Inventory</button>
      <button id="fill-defaults" class="btn ghost">Fill Default Stock</button>
    </div>
  </div>

  <!-- Sales Report Page -->
  <div class="content page {{ ($activePage == 'report') ? 'active' : '' }}" id="report">
    <div class="page-header">
      <h2>Sales Report</h2>
      <p class="page-header-desc">View daily and total sales.</p>
    </div>
    <div class="table-wrap">
      <table class="table" id="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Items Sold</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <!-- Sales report injected by JS -->
        </tbody>
      </table>
    </div>
    <div id="report-summary" style="margin-top:12px; font-weight:700;"></div>
    <div style="margin-top:12px;">
      <button id="clear-sales" class="btn ghost">Clear Sales</button>
    </div>
  </div>

</main>

<!-- Receipt Modal -->
<div id="receipt-modal" class="modal hidden" aria-hidden="true">
  <div class="modal-content">
    <div id="receipt"></div>
    <div class="modal-actions">
      <button id="print-receipt" class="btn primary">Print</button>
      <button id="close-receipt" class="btn ghost">Close</button>
    </div>
  </div>
</div>

<!-- Toast -->
<div id="toast" class="toast hidden"></div>

<!-- JS & CSS -->
<script src="{{ asset('js/pos.js') }}"></script>
<link rel="stylesheet" href="{{ asset('css/style.css') }}">

@endsection
