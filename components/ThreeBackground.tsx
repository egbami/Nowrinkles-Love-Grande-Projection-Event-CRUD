'use client'

import { useEffect, useRef } from 'react'

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    let animId: number

    const init = async () => {
      const THREE = await import('three')

      const mount = mountRef.current!
      const W = mount.clientWidth
      const H = mount.clientHeight

      // Scène
      const scene    = new THREE.Scene()
      const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
      camera.position.z = 6

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // ─── Particules ──────────────────────────────────────────────────────── //
      const PARTICLE_COUNT = 180
      const positions = new Float32Array(PARTICLE_COUNT * 3)
      const colors    = new Float32Array(PARTICLE_COUNT * 3)
      const speeds    = new Float32Array(PARTICLE_COUNT)
      const sizes     = new Float32Array(PARTICLE_COUNT)

      // Couleurs : gold (#C9A227) et lavender (#92A9E1)
      const gold    = new THREE.Color('#C9A227')
      const lavend  = new THREE.Color('#92A9E1')
      const cream   = new THREE.Color('#FFFFE4')

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Position aléatoire dans l'espace
        positions[i * 3]     = (Math.random() - 0.5) * 22
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6

        // Couleur mixée
        const roll = Math.random()
        const c = roll < 0.45
          ? gold.clone().lerp(cream, Math.random() * 0.3)
          : roll < 0.8
            ? lavend.clone().lerp(cream, Math.random() * 0.3)
            : cream.clone()

        colors[i * 3]     = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b

        speeds[i] = 0.003 + Math.random() * 0.008
        sizes[i]  = Math.random() * 2.5 + 0.5
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
        depthWrite: false,
      })

      const points = new THREE.Points(geometry, material)
      scene.add(points)

      // ─── Parallaxe souris ─────────────────────────────────────────────────── //
      let targetX = 0
      let targetY = 0
      const onMouseMove = (e: MouseEvent) => {
        targetX =  (e.clientX / window.innerWidth  - 0.5) * 0.6
        targetY = -(e.clientY / window.innerHeight - 0.5) * 0.4
      }
      window.addEventListener('mousemove', onMouseMove)

      // ─── Animation ───────────────────────────────────────────────────────── //
      const pos = geometry.attributes.position.array as Float32Array

      const animate = () => {
        animId = requestAnimationFrame(animate)

        // Déplacement vers le haut (montée douce)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          pos[i * 3 + 1] += speeds[i]
          if (pos[i * 3 + 1] > 6) {
            pos[i * 3 + 1] = -6
          }
        }
        geometry.attributes.position.needsUpdate = true

        // Rotation lente + suivi souris
        points.rotation.y += 0.0003
        camera.position.x += (targetX - camera.position.x) * 0.04
        camera.position.y += (targetY - camera.position.y) * 0.04

        renderer.render(scene, camera)
      }
      animate()

      // ─── Resize ──────────────────────────────────────────────────────────── //
      const onResize = () => {
        if (!mount) return
        const w = mount.clientWidth
        const h = mount.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      // Nettoyage
      return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        geometry.dispose()
        material.dispose()
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement)
        }
      }
    }

    let cleanup: (() => void) | undefined
    init().then((fn) => { cleanup = fn })

    return () => { cleanup?.() }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
