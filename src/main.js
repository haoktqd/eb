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
  const greenLight = new THREE.PointLight(0xee0033, 16, 12);
  greenLight.position.set(3, -1, 3);
  scene.add(greenLight);
  const coralLight = new THREE.PointLight(0xffffff, 9, 10);
  coralLight.position.set(-3, -2, 2);
  scene.add(coralLight);

  const instrument = new THREE.Group();
  scene.add(instrument);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.42, 72, 56),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.08, roughness: 0.36, clearcoat: 0.95, clearcoatRoughness: 0.16 })
  );
  instrument.add(core);

  const grid = new THREE.Mesh(
    new THREE.SphereGeometry(1.445, 28, 20),
    new THREE.MeshBasicMaterial({ color: 0xee0033, wireframe: true, transparent: true, opacity: 0.2 })
  );
  instrument.add(grid);

  const orbitSpecs = [
    { color: 0xee0033, rotation: [0.9, 0.16, 0.3], radius: 1.85, tube: 0.012 },
    { color: 0xffffff, rotation: [1.28, 0.75, -0.4], radius: 2.05, tube: 0.008 },
    { color: 0x929aa5, rotation: [0.08, -0.72, 1.1], radius: 1.72, tube: 0.009 }
  ];
  orbitSpecs.forEach(({ color, rotation, radius, tube }) => {
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 8, 180),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
    );
    orbit.rotation.set(...rotation);
    instrument.add(orbit);
  });

  const chartPoints = [
    [-2.45, -0.28, 0.48], [-1.95, -0.02, 0.45], [-1.55, -0.18, 0.43],
    [-1.13, 0.18, 0.4], [-0.73, 0.06, 0.37], [-0.3, 0.42, 0.34],
    [0.1, 0.27, 0.3], [0.5, 0.72, 0.28], [0.9, 0.57, 0.24],
    [1.32, 0.95, 0.19], [1.76, 0.82, 0.15], [2.18, 1.2, 0.1]
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const chartLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(chartPoints),
    new THREE.LineBasicMaterial({ color: 0xee0033, transparent: true, opacity: 0.85 })
  );
  instrument.add(chartLine);

  const pointGeometry = new THREE.SphereGeometry(0.038, 12, 12);
  chartPoints.forEach((point, index) => {
    const marker = new THREE.Mesh(
      pointGeometry,
      new THREE.MeshBasicMaterial({ color: index === chartPoints.length - 1 ? 0x1e2329 : 0xee0033 })
    );
    marker.position.copy(point);
    instrument.add(marker);
  });

  const starPositions = new Float32Array(240 * 3);
  for (let index = 0; index < 240; index += 1) {
    const radius = 2.55 + Math.random() * 1.7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[index * 3 + 2] = radius * Math.cos(phi);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0x929aa5, size: 0.018, transparent: true, opacity: 0.68 }));
  scene.add(stars);

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
      instrument.rotation.y = elapsed * 0.1 + pointer.x;
      instrument.rotation.x = Math.sin(elapsed * 0.22) * 0.035 + pointer.y;
      stars.rotation.y = elapsed * 0.012;
    } else {
      instrument.rotation.y = 0.12;
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