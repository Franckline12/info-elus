import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

/** Client Local API partagé : jamais de fetch HTTP vers notre propre API. */
export const getPayloadClient = (): Promise<Payload> => getPayload({ config: configPromise })
