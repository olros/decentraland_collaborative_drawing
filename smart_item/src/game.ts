import { Spawner } from '../node_modules/decentraland-builder-scripts/spawner'
//////////////////////////////import SignPost, { Props } from './item'
//////////////////////////////
//////////////////////////////const post = new SignPost()
//////////////////////////////const spawner = new Spawner<Props>(post)
//////////////////////////////
//////////////////////////////spawner.spawn(
//////////////////////////////  'post',
//////////////////////////////  new Transform({
//////////////////////////////    position: new Vector3(4, 1, 8),
//////////////////////////////    scale: new Vector3(4, 4, 4),
//////////////////////////////  }),
//////////////////////////////  {
//////////////////////////////    image: 'https://gfx.nrk.no/0vAsr1g2Ny1hkdU97vjx8we0p84SThYRfQ5ogbkVHzQA',
//////////////////////////////  }
//////////////////////////////)