import { supabase } from '../assets/js/supabase'

// CREATE
export async function createTodo(title: string) {
  const { data, error } = await supabase
    .from('menu')
    .insert([{ title }])
    .select()
  
  return { data, error }
}

// READ
export async function getTodos() {
  const { data, error } = await supabase
    .from('menu')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// UPDATE
export async function updateTodo(id: number, updates: any) {
  const { data, error } = await supabase
    .from('menu')
    .update(updates)
    .eq('id', id)
    .select()
  
  return { data, error }
}

// DELETE
export async function deleteTodo(id: number) {
  const { data, error } = await supabase
    .from('menu')
    .delete()
    .eq('id', id)
  
  return { data, error }
}

const { data, error } = await supabase
  .from('menu')
  .select('*')
  .order('id')

if (error) {
  console.error('Error:', error.message)
} else {
  console.log(data) // this should show your 11 menu items
}