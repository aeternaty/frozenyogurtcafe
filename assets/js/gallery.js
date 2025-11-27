// assets/js/gallery.js

const galleryImages = [
    'assets/images/store/1.jpg',
    'assets/images/store/2.jpg',
    'assets/images/store/3.jpeg',
    'assets/images/store/4.jpeg',
    'assets/images/store/5.jpeg',
    'assets/images/store/6.jpeg',
    'assets/images/store/7.jpeg',
    'assets/images/store/8.jpeg',
    'assets/images/store/9.jpeg',
    'assets/images/store/10.jpeg',
    'assets/images/store/11.jpeg',
    'assets/images/store/12.jpeg'
];

let currentImageIndex = 0;

function openGalleryModal(index) {
    currentImageIndex = index;
    updateModalImage();
    document.getElementById('gallery-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
    document.getElementById('gallery-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function updateModalImage() {
    document.getElementById('modal-image').src = galleryImages[currentImageIndex];
    document.getElementById('image-counter').textContent =
        `${currentImageIndex + 1} / ${galleryImages.length}`;
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateModalImage();
}

function previousImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModalImage();
}

document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('gallery-modal');
    if (!modal || modal.classList.contains('hidden')) return;

    if (e.key === 'Escape') closeGalleryModal();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') previousImage();
});
