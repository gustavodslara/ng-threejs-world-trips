import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripService } from '../../core/services/trip';
import { I18nService } from '../../core/services/i18n';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

@Component({
  selector: 'app-earth-viewer',
  imports: [CommonModule],
  templateUrl: './earth-viewer.html',
  styleUrl: './earth-viewer.css'
})
export class EarthViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('renderTarget', { static: false }) renderTarget!: ElementRef<HTMLDivElement>;
  @Output() tripClicked = new EventEmitter<any>();
  @Output() rightClick = new EventEmitter<{lat: number, lon: number}>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private labelRenderer!: CSS2DRenderer;
  private earth!: THREE.Mesh;
  private clock = new THREE.Clock(true);
  private animationId: number | null = null;
  private raycaster = new THREE.Raycaster();

  private readonly FOLDER_SIZE = 0.25;
  private readonly PHOTO_SPACING = 0.02;
  private readonly MIN_ZOOM = 1.01;
  private readonly MAX_ZOOM = 4;
  private readonly ZOOM_SENSITIVITY = 0.0005;
  private readonly ROTATE_SENSITIVITY = 0.2;
  private readonly DAMPING = 0.99;
  private readonly LERP_SPEED = 0.1;

  private freeSpinning = false;
  private prevCoords = { lat: 0, lon: 0 };
  private speed = { lat: 0, lon: 0 };
  private focusedFolderId: string | null = null;
  private isFocusing = false;
  private targetLat: number | null = null;
  private targetLon: number | null = null;
  private rotateCallback: (() => void) | null = null;

  constructor(
    private tripService: TripService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', () => this.onResize());
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.loadTripsAndRender();
  }

  private initThreeJS(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 100);
    this.camera.position.x = 3;
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff, 0);
    this.renderTarget.nativeElement.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.renderTarget.nativeElement.appendChild(this.labelRenderer.domElement);

    this.createEarth();

    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(5, 5, 5);
    this.scene.add(sun);

    this.renderer.domElement.addEventListener('wheel', (e) => this.onWheel(e));
    this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.renderer.domElement.addEventListener('mouseup', () => this.onMouseUp());
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener('contextmenu', (e) => this.onContextMenu(e));
  }

  private createEarth(): void {
    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: textureLoader.load('assets/images/earth/earth_texture_4k.jpg'),
      bumpMap: textureLoader.load('assets/images/earth/earth_bump_4k.jpg'),
      bumpScale: 0.05,
      specular: 0x555555,
      specularMap: textureLoader.load('assets/images/earth/earth_specular_4k.jpg')
    });
    this.earth = new THREE.Mesh(geometry, material);
    this.earth.name = 'earth';
    this.earth.rotation.order = 'ZYX';
    this.scene.add(this.earth);
  }

  private loadTripsAndRender(): void {
    this.tripService.loadTrips().subscribe(trips => {
      trips.forEach(trip => this.createTripFolder(trip));
      this.animate();
    });
  }

  private createTripFolder(trip: any): void {
    const textureLoader = new THREE.TextureLoader();
    const folderGroup = new THREE.Group();
    folderGroup.name = 'folder';
    folderGroup.userData = { ...trip, id: trip.id };

    trip.previewImages.forEach((url: string, index: number) => {
      textureLoader.load(url, (texture) => {
        const aspectRatio = texture.image.width / texture.image.height;
        const geometry = new THREE.PlaneGeometry(this.FOLDER_SIZE, this.FOLDER_SIZE / aspectRatio);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = index * this.PHOTO_SPACING;
        mesh.position.x = index * 0.01;
        mesh.position.y = -index * 0.01;
        folderGroup.add(mesh);
      });
    });

    const labelDiv = document.createElement('div');
    labelDiv.className = 'trip-label';
    labelDiv.innerHTML = `<div class="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto cursor-pointer hover:bg-black/80 transition-colors"><div class="text-white font-semibold text-sm whitespace-nowrap">${trip.location}</div><div class="text-white/70 text-xs whitespace-nowrap">${this.i18n.formatDate(trip.date)}</div></div>`;
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, -this.FOLDER_SIZE * 0.6, 0);
    folderGroup.add(label);

    const translateNode = new THREE.Object3D();
    translateNode.position.x = 1.05;
    translateNode.rotation.y = this.deg2rad(90);
    translateNode.add(folderGroup);

    const rotateNode = new THREE.Object3D();
    rotateNode.rotation.set(0, -this.deg2rad(trip.coords.lon), this.deg2rad(trip.coords.lat));
    rotateNode.add(translateNode);
    this.earth.add(rotateNode);
  }

  private animate(): void {
    const deltaTime = this.clock.getDelta();

    if (this.targetLat !== null && this.targetLon !== null) {
      const currentLat = this.getLatitude();
      const currentLon = this.getLongitude();
      const newLat = currentLat + (this.targetLat - currentLat) * this.LERP_SPEED;
      const newLon = currentLon + (this.targetLon - currentLon) * this.LERP_SPEED;
      this.rotate(newLat, newLon);
      if (Math.abs(this.targetLat - newLat) < 0.1 && Math.abs(this.targetLon - newLon) < 0.1) {
        this.targetLat = null;
        this.targetLon = null;
        if (this.rotateCallback) {
          this.rotateCallback();
          this.rotateCallback = null;
        }
      }
    } else if (this.freeSpinning) {
      this.speed.lat *= this.DAMPING;
      this.speed.lon *= this.DAMPING;
      this.rotate(
        this.getLatitude() + this.speed.lat * deltaTime,
        this.getLongitude() + this.speed.lon * deltaTime
      );
    }

    this.prevCoords.lat = this.getLatitude();
    this.prevCoords.lon = this.getLongitude();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private rotateSmooth(lat: number, lon: number, callback?: () => void): void {
    this.targetLat = lat;
    this.targetLon = lon;
    this.rotateCallback = callback || null;
    this.freeSpinning = false;
  }

  private rotate(lat: number, lon: number): void {
    lat = Math.max(-85, Math.min(lat, 85));
    if (lon > 180) lon -= 360;
    else if (lon < -180) lon += 360;
    this.earth.rotation.set(0, this.deg2rad(lon), this.deg2rad(-lat));
  }

  private zoom(delta: number): void {
    this.camera.position.x += delta * this.ZOOM_SENSITIVITY;
    this.camera.position.x = Math.max(this.MIN_ZOOM, Math.min(this.camera.position.x, this.MAX_ZOOM));
  }

  private isFolderCentered(coords: {lat: number, lon: number}): boolean {
    const currentLat = this.getLatitude();
    const currentLon = this.getLongitude();
    const latDiff = Math.abs(currentLat - coords.lat);
    const lonDiff = Math.abs(currentLon - coords.lon);
    return latDiff < 5 && lonDiff < 5;
  }

  private getLatitude(): number {
    return this.rad2deg(-this.earth.rotation.z);
  }

  private getLongitude(): number {
    return this.rad2deg(this.earth.rotation.y);
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
  }

  private cartesianToLatLon(point: THREE.Vector3): {lat: number, lon: number} {
    const lat = this.rad2deg(Math.asin(point.y));
    const lon = this.rad2deg(Math.atan2(point.x, point.z));
    return { lat, lon };
  }

  private onWheel(event: WheelEvent): void {
    if (document.body.getAttribute('data-language-hovered') === 'true') return;
    event.preventDefault();
    this.zoom(event.deltaY);
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    this.freeSpinning = false;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersections = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersections.length > 0) {
      const clickedPlane = intersections.find(x => x.object instanceof THREE.Mesh && x.object.geometry?.type === 'PlaneGeometry');
      if (!clickedPlane) return;
      let folder: any = clickedPlane.object;
      while (folder && folder.name !== 'folder') {
        folder = folder.parent;
      }
      if (folder && folder.userData?.id) {
        const trip = folder.userData;
        const isCentered = this.isFolderCentered(trip.coords);
        if (this.focusedFolderId === trip.id && isCentered && !this.isFocusing) {
          this.tripClicked.emit(trip);
        } else {
          this.focusedFolderId = trip.id;
          this.isFocusing = true;
          this.rotateSmooth(trip.coords.lat, trip.coords.lon, () => {
            this.isFocusing = false;
          });
        }
      }
    }
  }

  private onMouseUp(): void {
    this.freeSpinning = true;
  }

  private onMouseMove(event: MouseEvent): void {
    if (event.buttons !== 1) return;
    this.rotate(
      this.getLatitude() + event.movementY * this.ROTATE_SENSITIVITY,
      this.getLongitude() + event.movementX * this.ROTATE_SENSITIVITY
    );
  }

  private onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersections = this.raycaster.intersectObject(this.earth);
    if (intersections.length > 0) {
      const point = intersections[0].point;
      const coords = this.cartesianToLatLon(point);
      this.rightClick.emit(coords);
    }
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.onResize());
  }
}
