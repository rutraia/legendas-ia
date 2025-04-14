import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    async function checkIsAdmin() {
      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: user.id
        })

        if (error) {
          console.error('Erro ao verificar se usuário é admin:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(data)
        }
      } catch (error) {
        console.error('Erro ao verificar se usuário é admin:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkIsAdmin()
  }, [supabase, user])

  return { isAdmin, isLoading }
} 