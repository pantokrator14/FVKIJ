document.addEventListener('DOMContentLoaded', () => {
  const externalRadios = document.querySelectorAll('input[name="destinationType"]');
  const externalEntityGroup = document.getElementById('externalEntityGroup');
  
  if (externalRadios && externalEntityGroup) {
    externalRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        externalEntityGroup.style.display = 
          radio.value === 'external' ? 'block' : 'none';
      });
    });
  }
});