import { DelaySystem, setTimeout } from "./delay"

export type Props = {
  image: string
  edit_url: string
  image_refresh_rate: number
}

export default class DynamicImage implements IScript<Props> {
  delaySystem = new DelaySystem()
  
  init() {
    engine.addSystem(this.delaySystem)
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const sign = new Entity()
    sign.setParent(host)

    sign.addComponent(new Transform({}))

    const url = props.image
    const editUrl = props.edit_url || ""
    const image_refresh_rate = props.image_refresh_rate

    const generateEntity = (): Entity => {
      const texture = new Texture(`${url}?${url.indexOf('?') < 0 ? 'v' : '&'}=${new Date().toJSON()}`)
      const material = new Material()
      material.metallic = 0
      material.roughness = 1
      material.specularIntensity = 0
      material.albedoColor = Color3.Gray()
      material.albedoTexture = texture

      const img = new Entity()
      img.setParent(host)
      img.addComponent(new PlaneShape())
      img.addComponent(material)
      img.addComponent(
        new Transform({
          position: new Vector3(0, 0.5, 0),
          rotation: Quaternion.Euler(180, 0, 0),
          scale: new Vector3(1, 1, 1),
        })
      )
      if (editUrl.length > 3) {
        img.addComponent(
          new OnPointerDown(
            () => {
              openExternalURL(editUrl)
            },
            {
              button: ActionButton.POINTER,
              hoverText: "Click to edit image",
              distance: 6
            }
          )
        )
      }
      engine.addEntity(img)
      return img
    }

    let image = generateEntity()

    const replaceEntity = () => {
      setTimeout(() => {
        engine.removeEntity(image)
        image = generateEntity()
        replaceEntity()
      }, image_refresh_rate * 1000)
    }

    replaceEntity();
  }
}
