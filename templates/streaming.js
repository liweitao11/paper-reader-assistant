/* ============================================
   paper-reader-assistant · AI 流式输出 + 草稿自动保存
   集成方法：在 index.html 底部 </script> 后添加
   <script src="streaming.js"></script>
   ============================================ */

(function() {
  'use strict';

  // === 暗色模式切换 ===
  const themeToggle = document.createElement('button');
  themeToggle.id = 'theme-toggle';
  themeToggle.type = 'button';
  themeToggle.textContent = '🌙';
  themeToggle.title = '切换暗色/亮色模式';
  document.body.appendChild(themeToggle);

  const savedTheme = localStorage.getItem('paperReaderTheme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('paperReaderTheme', isDark ? 'dark' : 'light');
  });

  // === 草稿自动保存 ===
  const FORM_FIELDS = [
    'title', 'author', 'journal', 'year', 'research_area', 'tags',
    'background', 'core_problem', 'data_source', 'core_method',
    'technical_route', 'metric', 'metric_result', 'conclusion',
    'limitation', 'useful_method', 'future_direction', 'one_sentence',
    'innovation_rating', 'engineering_rating', 'relevance_rating'
  ];
  const DRAFT_KEY = 'paperReaderDraft';

  function saveDraft() {
    const form = document.querySelector('#paper-form');
    if (!form) return;
    const data = {};
    FORM_FIELDS.forEach(name => {
      const field = form.elements.namedItem(name);
      if (field && field.value) data[name] = field.value;
    });
    // 保存创新点
    data._innovations = [...document.querySelectorAll('.innovation-value')]
      .map(area => area.value).filter(Boolean);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) { /* localStorage 满或不可用 */ }
  }

  function loadDraft() {
    try {
      const data = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      if (Object.keys(data).length === 0) return;
      const form = document.querySelector('#paper-form');
      if (!form) return;
      FORM_FIELDS.forEach(name => {
        const field = form.elements.namedItem(name);
        if (field && data[name]) field.value = data[name];
      });
      // 恢复创新点
      if (data._innovations && data._innovations.length > 0) {
        const list = document.querySelector('#innovation-list');
        if (list) list.innerHTML = '';
        data._innovations.forEach(value => {
          if (typeof addInnovation === 'function') {
            addInnovation(value);
          }
        });
      }
      const status = document.querySelector('#status');
      if (status) {
        status.className = '';
        status.textContent = '已恢复上次未保存的草稿。';
      }
    } catch (e) { /* 忽略解析错误 */ }
  }

  // 每 5 秒自动保存
  setInterval(saveDraft, 5000);
  // 页面加载时恢复草稿
  setTimeout(loadDraft, 500);
  // 生成笔记成功后清除草稿
  const origSubmit = document.querySelector('#paper-form');
  if (origSubmit) {
    origSubmit.addEventListener('submit', () => {
      setTimeout(() => {
        const status = document.querySelector('#status');
        if (status && status.classList.contains('ok')) {
          localStorage.removeItem(DRAFT_KEY);
        }
      }, 1000);
    });
  }
  // 清空表单时也清除草稿
  const clearBtn = document.querySelector('#clear-form');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem(DRAFT_KEY);
    });
  }

  // === AI 流式输出 ===
  const aiRunBtn = document.querySelector('#ai-run');
  if (!aiRunBtn) return;

  // 创建进度条元素
  const aiStatus = document.querySelector('#ai-status');
  let progressBar = document.querySelector('#ai-progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'ai-progress-bar';
    progressBar.style.cssText = `
      width: 100%; height: 4px; background: #e0e0e0;
      border-radius: 2px; overflow: hidden; margin-top: 8px; display: none;
    `;
    progressBar.innerHTML = '<div style="width:0%;height:100%;background:linear-gradient(90deg,#7c3aed,#0d9488);transition:width 0.3s;border-radius:2px"></div>';
    if (aiStatus && aiStatus.parentNode) {
      aiStatus.parentNode.insertBefore(progressBar, aiStatus.nextSibling);
    }
  }

  // 替换原有的 AI 分析点击事件
  const newAiRunBtn = aiRunBtn.cloneNode(true);
  aiRunBtn.parentNode.replaceChild(newAiRunBtn, aiRunBtn);

  newAiRunBtn.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    if (!currentDocumentPath) {
      if (aiStatus) aiStatus.textContent = '请先读取本地文档，或选择一篇已下载 PDF 的 Zotero 文献。';
      return;
    }

    button.disabled = true;
    button.textContent = 'AI 正在阅读…';
    if (aiStatus) aiStatus.textContent = '正在提取正文并请求模型…';
    if (progressBar) {
      progressBar.style.display = 'block';
      progressBar.querySelector('div').style.width = '10%';
    }

    try {
      const local = (typeof aiMode !== 'undefined') ? aiMode === 'local' : false;
      const localModel = document.querySelector('#local-model-select')?.value;
      if (local && !localModel) throw new Error('请先下载或选择一个本地模型。');

      const selectedOutputLanguage = document.querySelector('#ai-output-language')?.value || 'auto';
      const outputLanguage = selectedOutputLanguage === 'auto'
        ? (typeof currentLanguage !== 'undefined' ? currentLanguage : 'zh')
        : selectedOutputLanguage;

      const form = document.querySelector('#paper-form');
      const payload = {
        source_file: currentDocumentPath,
        provider: local ? 'ollama' : (document.querySelector('#ai-provider')?.value || 'openai'),
        api_key: local ? '' : (document.querySelector('#ai-key')?.value || ''),
        save_api_key: local ? false : (document.querySelector('#save-ai-key')?.checked || false),
        model: local ? localModel : (document.querySelector('#ai-model')?.value || ''),
        endpoint: local ? 'http://127.0.0.1:11436/v1/chat/completions'
          : (document.querySelector('#ai-endpoint')?.value || ''),
        unload_after: false,
        output_language: outputLanguage,
        research_context: [
          form?.elements.namedItem('research_area')?.value,
          form?.elements.namedItem('tags')?.value
        ].filter(Boolean).join(outputLanguage === 'en' ? '; ' : '；')
      };

      // 尝试流式接口，失败则回退到普通接口
      let useStreaming = true;
      let result;

      try {
        const response = await fetch('/api/ai/analyze-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP ${response.status}`);
        }

        // 读取 SSE 流
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let progress = 10;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const chunk = JSON.parse(data);
                if (chunk.status === 'extracting') {
                  if (aiStatus) aiStatus.textContent = '正在提取文档正文…';
                  if (progressBar) progressBar.querySelector('div').style.width = '20%';
                } else if (chunk.status === 'requesting') {
                  if (aiStatus) aiStatus.textContent = '正在请求 AI 模型…';
                  if (progressBar) progressBar.querySelector('div').style.width = '35%';
                } else if (chunk.status === 'streaming') {
                  fullContent = chunk.content || fullContent;
                  progress = Math.min(90, progress + 2);
                  if (progressBar) progressBar.querySelector('div').style.width = `${progress}%`;
                  // 显示实时输出（前 200 字符预览）
                  if (aiStatus) {
                    const preview = fullContent.slice(0, 200);
                    aiStatus.textContent = `AI 输出中… ${preview}${fullContent.length > 200 ? '…' : ''}`;
                  }
                } else if (chunk.status === 'complete' && chunk.fields) {
                  result = chunk;
                  if (progressBar) progressBar.querySelector('div').style.width = '100%';
                } else if (chunk.status === 'error') {
                  throw new Error(chunk.message || 'AI 分析失败');
                }
              } catch (e) {
                if (e.message) throw e;
              }
            }
          }
        }

        if (!result || !result.fields) {
          throw new Error('流式响应未包含完整结果');
        }
      } catch (streamErr) {
        // 回退到普通接口
        console.warn('Streaming failed, falling back:', streamErr.message);
        useStreaming = false;
        if (aiStatus) aiStatus.textContent = '正在使用标准模式分析…';
        if (progressBar) progressBar.querySelector('div').style.width = '50%';

        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'AI 分析失败');
        }
        if (progressBar) progressBar.querySelector('div').style.width = '100%';
      }

      // 填入空白字段（与原逻辑一致）
      const fields = result.fields;
      const form2 = document.querySelector('#paper-form');
      const fieldNames = [
        'research_area', 'background', 'core_problem', 'data_source',
        'technical_route', 'core_method', 'metric', 'metric_result',
        'conclusion', 'limitation', 'useful_method', 'future_direction', 'one_sentence'
      ];

      fieldNames.forEach(name => {
        const input = form2.elements.namedItem(name);
        if (input && !input.value.trim() && fields[name]) {
          input.value = fields[name];
        }
      });

      const tags = form2.elements.namedItem('tags');
      if (tags && !tags.value.trim() && Array.isArray(fields.tags)) {
        tags.value = fields.tags.filter(Boolean).join(', ');
      }

      if (Array.isArray(fields.innovations)) {
        fields.innovations.filter(Boolean).forEach(value => {
          let target = [...document.querySelectorAll('.innovation-value')]
            .find(area => !area.value.trim());
          if (!target && typeof addInnovation === 'function') target = addInnovation();
          if (target) target.value = value;
        });
      }

      const validRatings = ['★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'];
      ['innovation_rating', 'engineering_rating', 'relevance_rating'].forEach(name => {
        const select = form2.elements.namedItem(name);
        const value = fields[name];
        if (select && !select.value && validRatings.includes(value)) {
          select.value = value;
        }
      });

      if (aiStatus) {
        aiStatus.textContent = '分析完成：已填入空白字段，原有内容保持不变。';
      }
      const statusBox = document.querySelector('#status');
      if (statusBox) {
        statusBox.className = 'ok';
        statusBox.textContent = 'AI 阅读结果已填入空白位置，请人工核对后再保存。';
      }

      // 2 秒后隐藏进度条
      setTimeout(() => {
        if (progressBar) progressBar.style.display = 'none';
      }, 2000);

    } catch (error) {
      if (aiStatus) aiStatus.textContent = error.message;
      if (progressBar) {
        progressBar.style.display = 'none';
      }
      const statusBox = document.querySelector('#status');
      if (statusBox) {
        statusBox.className = 'error';
        statusBox.textContent = error.message;
      }
    } finally {
      button.disabled = false;
      button.textContent = '分析当前文档并填空';
    }
  });

  // === 拖拽 PDF 到页面直接读取 ===
  document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  document.body.addEventListener('drop', async (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.match(/\.(pdf|docx|md|txt)$/i)) return;

    // 通过 API 上传文件路径信息（需要后端支持 /api/local-document-path）
    // 这里仅作为概念演示，实际需要后端配合
    const statusBox = document.querySelector('#status');
    if (statusBox) {
      statusBox.className = '';
      statusBox.textContent = `已拖入文件：${file.name}（拖拽读取功能需要后端配合实现）`;
    }
  });

})();
