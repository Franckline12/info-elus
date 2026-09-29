import { APIError, type CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'
import { CSE_NAME_MAX_LENGTH } from '../lib/quiz/grade'

/**
 * Parties jouées, à la seule fin d'alimenter le compteur communautaire du
 * § 2.5 (nombre de parties, taux de bonnes réponses) et de préparer le
 * classement entre élus d'un même CSE annoncé pour la V2.
 *
 * RGPD (§ 4.4) : aucune donnée personnelle. Pas d'email, pas de nom de
 * personne, pas d'adresse IP — l'IP ne sert qu'au comptage en mémoire de la
 * limitation de débit, elle n'est jamais écrite ici. `cseName` est une saisie
 * libre et facultative, annoncée comme publique côté front.
 */
export const QuizResults: CollectionConfig = {
  slug: 'quiz-results',
  labels: {
    singular: 'Résultat de quiz',
    plural: 'Résultats de quiz',
  },
  admin: {
    group: 'Données',
    hidden: false,
    useAsTitle: 'cseName',
    defaultColumns: ['quiz', 'score', 'total', 'cseName', 'playedAt'],
    description:
      'Parties enregistrées par les visiteurs. Lecture seule en pratique : les scores sont calculés par le serveur.',
  },
  access: {
    /**
     * Création publique : le front enregistre la partie d'un visiteur anonyme.
     * La route `/api/quiz/result` est le seul chemin prévu — elle recalcule le
     * score et limite le débit. Le hook ci-dessous rattrape ce qu'un appel
     * direct à l'API REST pourrait tenter d'écrire.
     */
    create: anyone,
    read: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  hooks: {
    beforeValidate: [
      /**
       * Garde-fou de cohérence, puisque la création est ouverte : un score
       * négatif, supérieur au barème, ou un total nul fausserait le compteur
       * communautaire.
       */
      ({ data }) => {
        if (!data) return data

        const score = Number(data.score)
        const total = Number(data.total)

        if (!Number.isFinite(total) || total <= 0) {
          throw new APIError(
            'Le barème du quiz (total) doit être un nombre strictement positif.',
            400,
          )
        }

        if (!Number.isFinite(score) || score < 0 || score > total) {
          throw new APIError('Le score doit être compris entre 0 et le barème du quiz.', 400)
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'quiz',
      type: 'relationship',
      label: 'Quiz',
      relationTo: 'quizzes',
      required: true,
      index: true,
      hasMany: false,
    },
    {
      name: 'score',
      type: 'number',
      label: 'Score',
      required: true,
      min: 0,
      admin: {
        description: 'Points obtenus, recalculés par le serveur.',
      },
    },
    {
      name: 'total',
      type: 'number',
      label: 'Barème',
      required: true,
      min: 1,
      admin: {
        description: 'Points maximum du quiz au moment de la partie.',
      },
    },
    {
      name: 'cseName',
      type: 'text',
      label: 'Nom du CSE',
      maxLength: CSE_NAME_MAX_LENGTH,
      index: true,
      admin: {
        description:
          'Saisie libre et facultative du joueur, en vue du classement par CSE (V2). Aucun nom de personne ne doit y figurer.',
      },
    },
    {
      name: 'playedAt',
      type: 'date',
      label: 'Jouée le',
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyyy HH:mm',
        },
      },
    },
  ],
}
