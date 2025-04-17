document.addEventListener('DOMContentLoaded', function() {
    const modelUrl = localStorage.getItem('arModelUrl');
    const loadingElement = document.getElementById('loading');
    
    if (!modelUrl) {
        alert('No model selected');
        window.location.href = 'products.html';
        return;
    }
    
    const modelEntity = document.querySelector('a-entity[gltf-model]');
    modelEntity.setAttribute('gltf-model', modelUrl);
    
    modelEntity.addEventListener('model-loaded', () => {
        loadingElement.style.display = 'none';
    });
    
    modelEntity.addEventListener('model-error', () => {
        loadingElement.textContent = 'Failed to load model';
        setTimeout(() => window.location.href = 'products.html', 2000);
    });
    
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'products.html';
    });
});