CAD files for 3D-printed Loko accessories.

Drop model files here using the slug used on /accessories/:
    collar-mount.stl        collar-mount.step
    drone-mount.stl         drone-mount.step
    belt-clip.stl           belt-clip.step
    ground-enclosure.stl    ground-enclosure.step

Then in accessories/index.html swap the card's
    <span class="acc-pending">…</span>
for
    <a class="acc-download" href="/files/cad/<slug>.stl" download>Download STL</a>
