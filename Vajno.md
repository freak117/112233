# Важно — история 3 последних диалогов

## Диалог 1
**Пользователь:** «Ошибка»

**Ассистент:**
Это снова баг старого `docker-compose` v1, не ошибка кода. Предложены шаги:
1. `cd ~/test`
2. `docker-compose stop server web`
3. `docker rm -f test_server_1 test_web_1`
4. `docker-compose up -d --no-deps server`
5. `docker-compose up -d --no-deps web`
6. `docker-compose ps`
7. `docker-compose logs --tail=120 server`

Если снова `ContainerConfig`:
1. `docker-compose down --remove-orphans`
2. `docker container prune -f`
3. `docker-compose up -d --build`

## Диалог 2
**Пользователь:** «Запиши 3 последних шага в файл Vajno.md продолжим в следующий раз»

**Ассистент:**
Создан файл `Vajno.md` с шагами:
1. `docker-compose down --remove-orphans`
2. `docker container prune -f`
3. `docker-compose up -d --build`

## Диалог 3
**Пользователь:** «Не так. Запиши в него историю 3х последних наших диалога»

**Ассистент:**
Обновил файл `Vajno.md` и записал историю 3 последних диалогов.
