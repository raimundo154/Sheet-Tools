import { supabase } from '../config/supabase';

/**
 * Serviço para gerenciar produtos no Supabase
 */
class ProductService {
  
  /**
   * Buscar todos os produtos do usuário logado
   */
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: 'Produtos carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Erro ao carregar produtos'
      };
    }
  }

  /**
   * Criar um novo produto
   */
  async createProduct(productData) {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Fazer upload da imagem se existir
      let imageUrl = null;
      let imageFileName = null;

      if (productData.image) {
        const imageResult = await this.uploadProductImage(productData.image, user.id);
        if (imageResult.success) {
          imageUrl = imageResult.url;
          imageFileName = imageResult.fileName;
        } else {
          console.warn('Falha no upload da imagem:', imageResult.message);
        }
      }

      // Preparar dados para inserção
      const insertData = {
        user_id: user.id,
        name: productData.name,
        price: parseFloat(productData.price),
        shipping_time: productData.shippingTime || null,
        in_stock: productData.inStock,
        image_url: imageUrl,
        image_file_name: imageFileName
      };

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        message: 'Produto criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Erro ao criar produto'
      };
    }
  }

  /**
   * Atualizar um produto existente
   */
  async updateProduct(productId, productData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados para atualização
      const updateData = {
        name: productData.name,
        price: parseFloat(productData.price),
        shipping_time: productData.shippingTime || null,
        in_stock: productData.inStock
      };

      // Fazer upload de nova imagem se existir
      if (productData.image) {
        const imageResult = await this.uploadProductImage(productData.image, user.id);
        if (imageResult.success) {
          updateData.image_url = imageResult.url;
          updateData.image_file_name = imageResult.fileName;
        }
      }

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        message: 'Produto atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Erro ao atualizar produto'
      };
    }
  }

  /**
   * Deletar um produto
   */
  async deleteProduct(productId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar o produto para deletar a imagem associada
      const { data: product } = await supabase
        .from('products')
        .select('image_file_name')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single();

      // Deletar a imagem se existir
      if (product?.image_file_name) {
        await this.deleteProductImage(product.image_file_name, user.id);
      }

      // Deletar o produto
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Produto deletado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return {
        success: false,
        message: error.message || 'Erro ao deletar produto'
      };
    }
  }

  /**
   * Upload de imagem do produto
   */
  async uploadProductImage(file, userId) {
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Obter URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        fileName: fileName,
        message: 'Imagem enviada com sucesso'
      };
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      return {
        success: false,
        url: null,
        fileName: null,
        message: error.message || 'Erro no upload da imagem'
      };
    }
  }

  /**
   * Deletar imagem do produto
   */
  async deleteProductImage(fileName, userId) {
    try {
      const filePath = `${userId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        console.warn('Erro ao deletar imagem:', error);
      }

      return { success: !error };
    } catch (error) {
      console.warn('Erro ao deletar imagem:', error);
      return { success: false };
    }
  }

  /**
   * Buscar produto por ID
   */
  async getProductById(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data,
        message: 'Produto encontrado'
      };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Produto não encontrado'
      };
    }
  }
}

export default new ProductService();
