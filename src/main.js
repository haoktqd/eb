import * as THREE from 'three';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createInvestmentScene() {
  const canvas = document.querySelector('#investment-scene');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);
  const redLight = new THREE.PointLight(0xee0033, 5, 9);
  redLight.position.set(3, -1, 3);
  scene.add(redLight);
  const fillLight = new THREE.PointLight(0xffffff, 7, 10);
  fillLight.position.set(-3, -2, 2);
  scene.add(fillLight);

  const instrument = new THREE.Group();
  scene.add(instrument);

  const earthRadius = 1.43;
  const earthAxis = new THREE.Group();
  earthAxis.rotation.z = THREE.MathUtils.degToRad(23.5);
  instrument.add(earthAxis);
  const earthGroup = new THREE.Group();
  earthAxis.add(earthGroup);

  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = 1024;
  mapCanvas.height = 512;
  const mapContext = mapCanvas.getContext('2d');
  mapContext.fillStyle = '#ffffff';
  mapContext.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
  const continents = [
    [[-168, 70], [-150, 64], [-137, 58], [-130, 49], [-124, 42], [-117, 32], [-108, 29], [-101, 22], [-91, 18], [-84, 10], [-78, 8], [-76, 20], [-82, 27], [-80, 34], [-73, 40], [-66, 47], [-60, 54], [-72, 60], [-91, 68], [-111, 72], [-134, 72], [-151, 68]],
    [[-53, 60], [-43, 59], [-35, 70], [-42, 82], [-55, 84], [-62, 76]],
    [[-81, 12], [-70, 10], [-62, 5], [-52, -2], [-45, -13], [-49, -25], [-55, -37], [-66, -55], [-73, -46], [-77, -29], [-80, -10]],
    [[-10, 36], [-9, 44], [-2, 51], [8, 55], [17, 60], [28, 70], [47, 72], [61, 66], [78, 72], [99, 69], [120, 58], [139, 53], [157, 60], [176, 53], [165, 43], [145, 39], [132, 32], [122, 21], [114, 7], [103, 1], [96, 12], [86, 20], [76, 8], [68, 24], [55, 26], [45, 14], [39, 28], [30, 33], [23, 38], [15, 45], [5, 43], [-2, 36]],
    [[-17, 35], [2, 37], [18, 33], [31, 30], [39, 16], [50, 11], [48, -10], [40, -24], [31, -34], [18, -35], [9, -21], [2, -5], [-6, 5], [-14, 15]],
    [[112, -11], [129, -10], [145, -16], [154, -27], [148, -39], [132, -44], [116, -34], [113, -23]],
    [[47, -13], [50, -16], [49, -25], [45, -25], [44, -18]]
  ];
  const mapX = (longitude) => ((longitude + 180) / 360) * mapCanvas.width;
  const mapY = (latitude) => ((90 - latitude) / 180) * mapCanvas.height;
  mapContext.fillStyle = '#e2e5e9';
  mapContext.strokeStyle = '#d2d6dc';
  mapContext.lineWidth = 2;
  continents.forEach((polygon) => {
    mapContext.beginPath();
    polygon.forEach(([longitude, latitude], index) => {
      const x = mapX(longitude);
      const y = mapY(latitude);
      if (index === 0) mapContext.moveTo(x, y);
      else mapContext.lineTo(x, y);
    });
    mapContext.closePath();
    mapContext.fill();
    mapContext.stroke();
  });
  const earthTexture = new THREE.CanvasTexture(mapCanvas);
  earthTexture.colorSpace = THREE.SRGBColorSpace;

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 96, 64),
    new THREE.MeshPhysicalMaterial({ map: earthTexture, roughness: 0.72, metalness: 0.02, clearcoat: 0.2 })
  );
  earthGroup.add(earth);

  const coordinatesToVector = (latitude, longitude, radius) => {
    const lat = THREE.MathUtils.degToRad(latitude);
    const lon = THREE.MathUtils.degToRad(longitude);
    return new THREE.Vector3(
      radius * Math.cos(lat) * Math.sin(lon),
      radius * Math.sin(lat),
      radius * Math.cos(lat) * Math.cos(lon)
    );
  };
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0xee0033, transparent: true, opacity: 0.48, depthWrite: false });
  for (let longitude = -180; longitude < 180; longitude += 15) {
    const points = [];
    for (let latitude = -87; latitude <= 87; latitude += 3) {
      points.push(coordinatesToVector(latitude, longitude, earthRadius + 0.012));
    }
    earthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMaterial));
  }
  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const points = [];
    for (let longitude = -180; longitude < 180; longitude += 3) {
      points.push(coordinatesToVector(latitude, longitude, earthRadius + 0.012));
    }
    earthGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), gridMaterial));
  }

  const locations = [
    { latitude: 40.7128, longitude: -74.006, city: 'NEW YORK', asset: 'BTC' },
    { latitude: 51.5072, longitude: -0.1276, city: 'LONDON', asset: 'ETH' },
    { latitude: 1.3521, longitude: 103.8198, city: 'SINGAPORE', asset: 'SOL' },
    { latitude: 35.6762, longitude: 139.6503, city: 'TOKYO', asset: 'XRP' }
  ];
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xee0033 });
  const markerGeometry = new THREE.SphereGeometry(0.055, 20, 16);
  locations.forEach(({ latitude, longitude, city, asset }) => {
    const surfacePoint = coordinatesToVector(latitude, longitude, earthRadius + 0.035);
    const outward = surfacePoint.clone().normalize();
    const labelPoint = coordinatesToVector(latitude, longitude, earthRadius + 0.31);
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(surfacePoint);
    earthGroup.add(marker);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 36), markerMaterial);
    ring.position.copy(surfacePoint);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward);
    earthGroup.add(ring);

    const callout = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([surfacePoint, labelPoint]),
      new THREE.LineBasicMaterial({ color: 0xee0033, transparent: true, opacity: 0.8 })
    );
    earthGroup.add(callout);

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 320;
    labelCanvas.height = 112;
    const labelContext = labelCanvas.getContext('2d');
    labelContext.fillStyle = 'rgba(255, 255, 255, 0.96)';
    labelContext.strokeStyle = '#ee0033';
    labelContext.lineWidth = 5;
    labelContext.beginPath();
    labelContext.roundRect(4, 4, 312, 104, 20);
    labelContext.fill();
    labelContext.stroke();
    labelContext.textAlign = 'center';
    labelContext.fillStyle = '#ee0033';
    labelContext.font = '700 46px sans-serif';
    labelContext.fillText(asset, 160, 57);
    labelContext.fillStyle = '#474d57';
    labelContext.font = '700 17px sans-serif';
    labelContext.fillText(city, 160, 86);

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: labelTexture,
      transparent: true,
      depthTest: true,
      depthWrite: false
    }));
    labelSprite.position.copy(labelPoint);
    labelSprite.scale.set(0.82, 0.287, 1);
    earthGroup.add(labelSprite);
  });

  const moonCanvas = document.createElement('canvas');
  moonCanvas.width = 256;
  moonCanvas.height = 128;
  const moonContext = moonCanvas.getContext('2d');
  moonContext.fillStyle = '#d9dce1';
  moonContext.fillRect(0, 0, moonCanvas.width, moonCanvas.height);
  const moonCraters = [
    [44, 39, 16], [92, 73, 24], [151, 36, 19], [204, 81, 25],
    [228, 27, 11], [32, 103, 9], [137, 101, 12], [181, 65, 8]
  ];
  moonCraters.forEach(([x, y, radius]) => {
    const gradient = moonContext.createRadialGradient(x - radius * 0.25, y - radius * 0.25, radius * 0.12, x, y, radius);
    gradient.addColorStop(0, '#c4c8ce');
    gradient.addColorStop(0.72, '#d2d5da');
    gradient.addColorStop(1, '#b8bdc5');
    moonContext.fillStyle = gradient;
    moonContext.beginPath();
    moonContext.arc(x, y, radius, 0, Math.PI * 2);
    moonContext.fill();
  });
  const moonTexture = new THREE.CanvasTexture(moonCanvas);
  moonTexture.colorSpace = THREE.SRGBColorSpace;

  const moonOrbitRadius = 1.92;
  const moonOrbitPoints = Array.from({ length: 96 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * moonOrbitRadius, 0, Math.sin(angle) * moonOrbitRadius);
  });
  const moonOrbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(moonOrbitPoints),
    new THREE.LineBasicMaterial({ color: 0xb7bdc6, transparent: true, opacity: 0.55 })
  );
  earthAxis.add(moonOrbit);

  const moonPivot = new THREE.Group();
  earthAxis.add(moonPivot);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 40, 32),
    new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 0.95, metalness: 0 })
  );
  moon.position.set(moonOrbitRadius, 0, 0);
  moonPivot.add(moon);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.3;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.22;
  };
  canvas.addEventListener('pointermove', onPointerMove);

  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });
  resizeObserver.observe(canvas);

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) {
      earthGroup.rotation.y = elapsed * 0.1 + pointer.x;
      moonPivot.rotation.y = elapsed * 0.065;
      instrument.rotation.y = pointer.x * 0.12;
      instrument.rotation.x = pointer.y * 0.12;
    } else {
      earthGroup.rotation.y = 0.12;
      moonPivot.rotation.y = 0.3;
    }
    renderer.render(scene, camera);
    if (!reducedMotion) requestAnimationFrame(animate);
  };
  animate();
}

createInvestmentScene();

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Mở menu điều hướng' : 'Đóng menu điều hướng');
  mainNav?.classList.toggle('is-open', !isOpen);
});
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Mở menu điều hướng');
  mainNav.classList.remove('is-open');
}));

const toast = document.querySelector('.toast');
let toastTimeout;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

document.querySelectorAll('[data-copy-link]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyLink);
      const label = button.getAttribute('aria-label')?.replace('Sao chép liên kết ', '') ?? 'Binance';
      showToast(`Đã sao chép liên kết ${label}.`);
    } catch {
      showToast('Không thể sao chép tự động. Hãy mở liên kết bên cạnh mã QR.');
    }
  });
});

const quizFeedback = document.querySelector('.quiz-feedback');
const quizResponses = {
  plan: 'Đây là điểm khởi đầu hữu ích: đối chiếu biến động với mục tiêu, thời hạn và mức rủi ro bạn đã chấp nhận.',
  sell: 'Trước khi quyết định, hãy kiểm tra điều gì đã thay đổi: luận điểm đầu tư, nhu cầu tiền mặt hay chỉ là cảm xúc trước biến động?',
  buy: 'Giá thấp hơn chưa tự động có nghĩa là phù hợp. Hãy xem lại luận điểm, phân bổ và khả năng chịu thêm rủi ro.'
};
document.querySelectorAll('[data-quiz-answer]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-quiz-answer]').forEach((option) => option.classList.remove('is-selected'));
    button.classList.add('is-selected');
    if (quizFeedback) quizFeedback.textContent = quizResponses[button.dataset.quizAnswer];
  });
});

const styleContent = {
  long: {
    title: 'Kiên nhẫn là một chiến lược.',
    description: 'Ưu tiên mục tiêu dài hạn, hiểu tài sản mình nắm giữ và định kỳ xem lại phân bổ. Biến động ngắn hạn không nhất thiết phải dẫn đến hành động vội vàng.',
    tags: ['Ít giao dịch', 'Kỷ luật', 'Tầm nhìn dài']
  },
  balance: {
    title: 'Cân bằng giữa tăng trưởng và ổn định.',
    description: 'Xác định tỷ trọng phù hợp với thời hạn và khả năng chịu rủi ro. Việc tái cân bằng định kỳ giúp danh mục không trôi quá xa khỏi mục tiêu ban đầu.',
    tags: ['Phân bổ', 'Định kỳ', 'Đa dạng hóa']
  },
  active: {
    title: 'Chủ động, nhưng có nguyên tắc.',
    description: 'Theo dõi cơ hội thường xuyên hơn đòi hỏi kế hoạch vào lệnh, giới hạn thua lỗ và nhật ký rõ ràng. Chi phí và cảm xúc cũng là một phần của kết quả.',
    tags: ['Theo dõi sát', 'Quản trị vốn', 'Có kế hoạch']
  }
};
const styleTabs = document.querySelectorAll('[data-style]');
const stylePanel = document.querySelector('#style-panel');
styleTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    styleTabs.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
      item.tabIndex = -1;
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = 0;
    const data = styleContent[tab.dataset.style];
    if (!stylePanel || !data) return;
    stylePanel.setAttribute('aria-labelledby', tab.id);
    stylePanel.querySelector('.style-panel-index').textContent = String(index + 1).padStart(2, '0');
    stylePanel.querySelector('h3').textContent = data.title;
    stylePanel.querySelector('.style-panel > div > p:last-child').textContent = data.description;
    stylePanel.querySelector('.style-tags').innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join('');
  });
  tab.tabIndex = tab.classList.contains('is-active') ? 0 : -1;
});

const resources = {
  checklist: {
    filename: 'northstar-checklist.txt',
    type: 'text/plain;charset=utf-8',
    contents: 'NORTHSTAR | CHECKLIST TRƯỚC KHI ĐẦU TƯ\n\n1. Mục tiêu và thời hạn của khoản đầu tư là gì?\n2. Tôi có thể chấp nhận mức giảm tối đa bao nhiêu?\n3. Tôi hiểu sản phẩm và các chi phí liên quan chưa?\n4. Quyết định này có phù hợp với kế hoạch tổng thể không?\n5. Tôi đã kiểm tra nguồn thông tin độc lập chưa?\n6. Tôi có đang hành động vì sợ bỏ lỡ hoặc hoảng loạn không?\n7. Kịch bản nào sẽ khiến tôi xem lại luận điểm?\n8. Tôi đã xác định quy mô vị thế phù hợp chưa?\n9. Khoản tiền này có cần cho chi tiêu thiết yếu không?\n10. Tôi đã ghi lại lý do cho quyết định này chưa?\n\nNội dung giáo dục, không phải tư vấn tài chính.'
  },
  journal: {
    filename: 'northstar-trading-journal.csv',
    type: 'text/csv;charset=utf-8',
    contents: '\uFEFFNgày,Tài sản,Loại giao dịch,Lý do vào lệnh,Quy mô,Điểm thoát dự kiến,Kết quả,Bài học\n'
  }
};
document.querySelectorAll('[data-download]').forEach((button) => {
  button.addEventListener('click', () => {
    const resource = resources[button.dataset.download];
    if (!resource) return;
    const blob = new Blob([resource.contents], { type: resource.type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = resource.filename;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast(`Đã tải ${resource.filename}.`);
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.content-section, .store-section, .about-section, .qr-section').forEach((section) => revealObserver.observe(section));