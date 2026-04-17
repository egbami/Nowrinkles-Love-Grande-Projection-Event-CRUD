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
      const camera   = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000)
      camera.position.z = 8

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // ─── Particules pour la Croix ────────────────────────────────────────── //
      const PARTICLE_COUNT = 800
      const positions = new Float32Array(PARTICLE_COUNT * 3)
      const colors    = new Float32Array(PARTICLE_COUNT * 3)
      const origins   = new Float32Array(PARTICLE_COUNT * 3) // Pour un effet de respiration
      const phases    = new Float32Array(PARTICLE_COUNT)

      const lavend    = new THREE.Color('#92A9E1')
      const graphite  = new THREE.Color('#2A2A2A')

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x, y, z;
        const roll = Math.random()

        if (roll < 0.35) {
          // Poutre verticale de la croix
          x = (Math.random() - 0.5) * 0.4
          y = (Math.random() - 0.5) * 4.5
          z = (Math.random() - 0.5) * 0.4
        } else if (roll < 0.6) {
          // Poutre horizontale de la croix (croisement un peu vers le haut)
          x = (Math.random() - 0.5) * 3
          y = (Math.random() - 0.5) * 0.4 + 0.8
          z = (Math.random() - 0.5) * 0.4
        } else {
          // Particules ambiantes
          x = (Math.random() - 0.5) * 18
          y = (Math.random() - 0.5) * 18
          z = (Math.random() - 0.5) * 12
        }

        origins[i * 3]     = x
        origins[i * 3 + 1] = y
        origins[i * 3 + 2] = z

        positions[i * 3]     = x
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z

        // Couleur : Graphite pour la structure robuste, Lavender pour le halo divin
        const c = Math.random() > 0.6 ? lavend : graphite
        colors[i * 3]     = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b

        phases[i] = Math.random() * Math.PI * 2
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

      // Création d'une texture de particule ronde très douce
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')!
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 32, 32)
      const texture = new THREE.CanvasTexture(canvas)

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.35, // Très subtil pour correspondre à "sobre" et "minimaliste"
        map: texture,
        depthWrite: false,
        blending: THREE.NormalBlending,
      })

      const particles = new THREE.Points(geometry, material)
      // Légère inclinaison pour l'effet de suspension 3D
      particles.rotation.x = 0.1
      particles.rotation.z = -0.05
      scene.add(particles)

      // ─── Parallaxe souris ─────────────────────────────────────────────────── //
      let targetX = 0
      let targetY = 0
      const onMouseMove = (e: MouseEvent) => {
        targetX =  (e.clientX / window.innerWidth  - 0.5) * 1.5
        targetY = -(e.clientY / window.innerHeight - 0.5) * 1.5
      }
      window.addEventListener('mousemove', onMouseMove)

      // ─── Animation ───────────────────────────────────────────────────────── //
      const pos = geometry.attributes.position.array as Float32Array
      let time = 0

      const animate = () => {
        animId = requestAnimationFrame(animate)
        time += 0.005

        // Mouvement de respiration (particules qui flottent lentement)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const ix = i * 3
          const iy = i * 3 + 1
          const iz = i * 3 + 2

          // Oscillation douce autour du point d'origine
          pos[ix] = origins[ix] + Math.sin(time + phases[i]) * 0.1
          pos[iy] = origins[iy] + Math.cos(time * 0.8 + phases[i]) * 0.1
          pos[iz] = origins[iz] + Math.sin(time * 1.2 + phases[i]) * 0.1
        }
        geometry.attributes.position.needsUpdate = true

        // Rotation extrêmement lente de l'ensemble
        particles.rotation.y = Math.sin(time * 0.5) * 0.2

        camera.position.x += (targetX - camera.position.x) * 0.02
        camera.position.y += (targetY - camera.position.y) * 0.02
        camera.lookAt(scene.position)

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
        texture.dispose()
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
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
