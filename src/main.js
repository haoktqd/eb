import * as THREE from 'three';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createStardust() {
  const canvas = document.querySelector('#stardust-scene');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;

  const particles = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let previousTime = 0;

  const resize = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.min(110, Math.max(44, Math.round((width * height) / 11500)));
    particles.length = 0;
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.65 + Math.random() * 1.8,
        speed: 9 + Math.random() * 23,
        drift: (Math.random() - 0.5) * 7,
        color: Math.random() < 0.05 ? '#ee0033' : '#ffffff',
        phase: Math.random() * Math.PI * 2
      });
    }
  };

  const render = (time = 0) => {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    context.clearRect(0, 0, width, height);
    context.globalAlpha = 0.3;

    particles.forEach((particle) => {
      if (!reducedMotion) {
        particle.y -= particle.speed * delta;
        particle.x += particle.drift * delta;
        particle.phase += delta * 1.4;
        if (particle.y < -4) {
          particle.y = height + 4;
          particle.x = Math.random() * width;
        }
        if (particle.x < -4) particle.x = width + 4;
        if (particle.x > width + 4) particle.x = -4;
      }

      context.beginPath();
      context.fillStyle = particle.color;
      context.shadowColor = particle.color === '#ffffff' ? 'rgba(70, 78, 88, 0.42)' : 'rgba(238, 0, 51, 0.35)';
      context.shadowBlur = particle.radius * 2.5;
      context.arc(particle.x, particle.y + Math.sin(particle.phase) * 1.5, particle.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    context.shadowBlur = 0;
    if (!reducedMotion) requestAnimationFrame(render);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  render();
}

createStardust();

function createInvestmentScene(canvas) {
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 5.2);

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

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 96, 64),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, roughness: 0.72, metalness: 0.02, clearcoat: 0.2 })
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
  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const points = [];
    for (let longitude = -180; longitude < 180; longitude += 3) {
      points.push(coordinatesToVector(latitude, longitude, earthRadius + 0.012));
    }
    earthGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), gridMaterial));
  }

  const assetLocations = [
    { latitude: 40.7128, longitude: -74.006, asset: 'USD', symbol: '$' },
    { latitude: 1.3521, longitude: 103.8198, asset: 'BTC', symbol: '\u20bf' },
    { latitude: 51.5072, longitude: -0.1276, asset: 'ETH', symbol: '\u039e' }
  ];
  const createAssetBadge = (asset, symbol) => {
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 256;
    const context = badgeCanvas.getContext('2d');
    context.fillStyle = '#ee0033';
    context.font = '700 108px "Segoe UI Symbol", "Arial Unicode MS", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(symbol, 128, 105);

    context.fillStyle = '#474d57';
    context.font = '700 24px sans-serif';
    context.textBaseline = 'alphabetic';
    context.fillText(asset, 128, 238);

    const texture = new THREE.CanvasTexture(badgeCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false
    }));
  };

  assetLocations.forEach(({ latitude, longitude, asset, symbol }) => {
    const badge = createAssetBadge(asset, symbol);
    badge.position.copy(coordinatesToVector(latitude, longitude, earthRadius + 0.08));
    badge.scale.set(0.3, 0.3, 1);
    earthGroup.add(badge);
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
    const globeDiameter = Math.max(700, width * 0.7);
    camera.position.z = (earthRadius * height) / (globeDiameter * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    const canvasTop = canvas.getBoundingClientRect().top;
    const targetCenter = canvasTop + globeDiameter / 2;
    const canvasCenter = canvasTop + height / 2;
    const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    instrument.position.y = ((canvasCenter - targetCenter) * viewHeight) / height;
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

createInvestmentScene(document.querySelector('#investment-scene'));

const earthBackdrop = document.querySelector('.earth-backdrop');
const mainElement = document.querySelector('main');
const entertainmentSection = document.querySelector('#entertainment');
const resizeEarthBackdrop = () => {
  if (!earthBackdrop || !mainElement || !entertainmentSection) return;
  const mainTop = mainElement.getBoundingClientRect().top;
  const entertainmentBottom = entertainmentSection.getBoundingClientRect().bottom;
  const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
  earthBackdrop.style.height = `${Math.max(0, Math.ceil(entertainmentBottom - mainTop + headerHeight))}px`;
};
resizeEarthBackdrop();
const earthBackdropObserver = new ResizeObserver(resizeEarthBackdrop);
if (mainElement) earthBackdropObserver.observe(mainElement);
if (entertainmentSection) earthBackdropObserver.observe(entertainmentSection);
window.addEventListener('resize', resizeEarthBackdrop, { passive: true });

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